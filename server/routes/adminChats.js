const express = require('express');
const mongoose = require('mongoose');
const Match = require('../models/Match');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const USER_FIELDS = { _id: 1, name: 1, email: 1, profilePhoto: 1, isActive: 1, createdAt: 1 };

const parseDate = (value) => {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

const parseInteger = (value, fallback, max) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= 1 && number <= max ? number : null;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pairMessageLookup = (additionalStages = []) => ({
  $lookup: {
    from: Message.collection.name,
    let: { users: '$users' },
    pipeline: [
      {
        $match: {
          $expr: {
            $or: [
              {
                $and: [
                  { $eq: ['$sender', { $arrayElemAt: ['$$users', 0] }] },
                  { $eq: ['$receiver', { $arrayElemAt: ['$$users', 1] }] },
                ],
              },
              {
                $and: [
                  { $eq: ['$sender', { $arrayElemAt: ['$$users', 1] }] },
                  { $eq: ['$receiver', { $arrayElemAt: ['$$users', 0] }] },
                ],
              },
            ],
          },
        },
      },
      ...additionalStages,
    ],
    as: 'conversationMessages',
  },
});

const conversationStages = () => [
  {
    $lookup: {
      from: User.collection.name,
      localField: 'users',
      foreignField: '_id',
      pipeline: [{ $project: USER_FIELDS }],
      as: 'participantDocs',
    },
  },
  {
    $addFields: {
      participants: {
        $map: {
          input: { $ifNull: ['$users', []] },
          as: 'userId',
          in: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$participantDocs',
                      as: 'participant',
                      cond: { $eq: ['$$participant._id', '$$userId'] },
                    },
                  },
                  0,
                ],
              },
              null,
            ],
          },
        },
      },
    },
  },
  pairMessageLookup([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        lastActivity: { $max: '$createdAt' },
        latestMessage: { $first: '$createdAt' },
      },
    },
  ]),
  {
    $addFields: {
      messageStats: { $arrayElemAt: ['$conversationMessages', 0] },
      status: {
        $cond: [
          {
            $and: [
              { $eq: [{ $size: { $ifNull: ['$users', []] } }, 2] },
              { $eq: [{ $size: '$participantDocs' }, 2] },
              {
                $allElementsTrue: {
                  $map: {
                    input: '$participantDocs',
                    as: 'participant',
                    in: { $ne: ['$$participant.isActive', false] },
                  },
                },
              },
            ],
          },
          'active',
          'unavailable',
        ],
      },
      messageCount: { $ifNull: ['$messageStats.total', 0] },
      unreadCount: { $ifNull: ['$messageStats.unread', 0] },
      lastActivity: { $ifNull: ['$messageStats.lastActivity', null] },
    },
  },
  { $unset: ['conversationMessages', 'participantDocs', 'messageStats'] },
];

router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const activityStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [
      totalConversations,
      todayChats,
      totalMessages,
      messagesToday,
      unreadMessages,
      activeConversations,
      activeChatters,
    ] = await Promise.all([
      Match.countDocuments(),
      Match.countDocuments({ createdAt: { $gte: todayStart, $lte: now } }),
      Message.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: todayStart, $lte: now } }),
      Message.countDocuments({ isRead: false }),
      Match.aggregate([
        pairMessageLookup([{ $match: { createdAt: { $gte: activityStart } } }, { $limit: 1 }]),
        { $match: { conversationMessages: { $ne: [] } } },
        { $count: 'total' },
      ]),
      Message.aggregate([
        { $match: { createdAt: { $gte: activityStart } } },
        { $project: { people: ['$sender', '$receiver'] } },
        { $unwind: '$people' },
        { $group: { _id: '$people' } },
        { $count: 'total' },
      ]),
    ]);
    const activeCount = activeConversations[0]?.total || 0;
    const chatterCount = activeChatters[0]?.total || 0;
    return res.json({
      success: true,
      summary: {
        totalConversations,
        activeConversations: activeCount,
        todayChats,
        messagesToday,
        totalMessages,
        unreadMessages,
        activeChatters: chatterCount,
        activeChattersPeriodDays: 30,
        averageMessagesPerConversation: totalConversations
          ? Number((totalMessages / totalConversations).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    console.error('Get admin chat summary error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load chat summary' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const days = parseInteger(req.query.days, 7, 30);
    if (days === null) return res.status(400).json({ success: false, message: 'Days must be between 1 and 30' });
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [messageActivity, conversationActivity] = await Promise.all([
      Message.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Match.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    return res.json({ success: true, days, messageActivity, conversationActivity });
  } catch (error) {
    console.error('Get admin chat analytics error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load chat analytics' });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1, 10000);
    const limit = parseInteger(req.query.limit, 20, 100);
    const { search = '', from, to, activityFrom, activityTo, status = 'all', sort = 'newest' } = req.query;
    if (page === null || limit === null) return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    if (typeof search !== 'string' || search.length > 100) return res.status(400).json({ success: false, message: 'Search must be 100 characters or fewer' });
    if (typeof status !== 'string' || !['all', 'active', 'unavailable'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid conversation status' });
    if (typeof sort !== 'string' || !['newest', 'oldest', 'activity', 'messages'].includes(sort)) return res.status(400).json({ success: false, message: 'Invalid sort option' });

    const start = from ? parseDate(from) : null;
    const end = to ? parseDate(to) : null;
    const activityStart = activityFrom ? parseDate(activityFrom) : null;
    const activityEnd = activityTo ? parseDate(activityTo) : null;
    if ((from && !start) || (to && !end) || (activityFrom && !activityStart) || (activityTo && !activityEnd)) {
      return res.status(400).json({ success: false, message: 'Dates must be valid YYYY-MM-DD values' });
    }
    if ((start && end && start > end) || (activityStart && activityEnd && activityStart > activityEnd)) {
      return res.status(400).json({ success: false, message: 'Start date must not be after end date' });
    }
    const baseMatch = {};
    if (start || end) {
      baseMatch.createdAt = {};
      if (start) baseMatch.createdAt.$gte = start;
      if (end) {
        const exclusiveEnd = new Date(end);
        exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
        baseMatch.createdAt.$lt = exclusiveEnd;
      }
    }
    const pipeline = [
      ...(Object.keys(baseMatch).length ? [{ $match: baseMatch }] : []),
      ...conversationStages(),
    ];
    const query = search.trim();
    if (query) {
      const regex = { $regex: escapeRegex(query), $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
            { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: escapeRegex(query), options: 'i' } } },
            { 'participants.name': regex },
            { 'participants.email': regex },
          ],
        },
      });
    }
    if (status !== 'all') pipeline.push({ $match: { status } });
    if (activityStart || activityEnd) {
      const activity = {};
      if (activityStart) activity.$gte = activityStart;
      if (activityEnd) {
        const exclusiveEnd = new Date(activityEnd);
        exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
        activity.$lt = exclusiveEnd;
      }
      pipeline.push({ $match: { lastActivity: activity } });
    }
    const sortStage = sort === 'oldest'
      ? { createdAt: 1 }
      : sort === 'activity'
        ? { lastActivity: -1, createdAt: -1 }
        : sort === 'messages'
          ? { messageCount: -1, createdAt: -1 }
          : { createdAt: -1 };
    pipeline.push({
      $facet: {
        conversations: [
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              status: 1,
              participants: {
                $map: {
                  input: '$participants',
                  as: 'participant',
                  in: {
                    _id: '$$participant._id',
                    name: '$$participant.name',
                    profilePhoto: '$$participant.profilePhoto',
                    isActive: '$$participant.isActive',
                  },
                },
              },
              lastActivity: 1,
              messageCount: 1,
              unreadCount: 1,
            },
          },
        ],
        metadata: [{ $count: 'total' }],
      },
    });
    const [result] = await Match.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    return res.json({
      success: true,
      conversations: result?.conversations || [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin chats error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load conversations' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!OBJECT_ID_PATTERN.test(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
    }
    const [conversation] = await Match.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      ...conversationStages(),
      {
        $project: {
          _id: 1,
          createdAt: 1,
          status: 1,
          participants: {
            $map: {
              input: '$participants',
              as: 'participant',
              in: {
                _id: '$$participant._id',
                name: { $ifNull: ['$$participant.name', 'Unavailable user'] },
                profilePhoto: '$$participant.profilePhoto',
                isActive: '$$participant.isActive',
                registered: { $ne: ['$$participant', null] },
              },
            },
          },
          lastActivity: 1,
          messageCount: 1,
          unreadCount: 1,
        },
      },
    ]);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const safeConversation = {
      _id: conversation._id,
      createdAt: conversation.createdAt,
      status: conversation.status,
      participants: (conversation.participants || []).map((participant) => participant && ({
        _id: participant._id,
        name: participant.name || 'Unavailable user',
        profilePhoto: participant.profilePhoto || '',
        isActive: participant.isActive !== false,
        registered: participant.registered !== false,
      })),
      lastActivity: conversation.lastActivity || null,
      messageCount: conversation.messageCount || 0,
      unreadCount: conversation.unreadCount || 0,
    };
    return res.json({ success: true, conversation: safeConversation });
  } catch (error) {
    console.error('Get admin chat details error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load conversation details' });
  }
});

module.exports = router;
