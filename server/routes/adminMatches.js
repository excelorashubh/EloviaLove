const express = require('express');
const mongoose = require('mongoose');
const Match = require('../models/Match');
const User = require('../models/User');
const Message = require('../models/Message');
const Like = require('../models/Like');

const router = express.Router();
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PAGE = 10000;
const MAX_PAGE_SIZE = 100;
const USER_PROJECTION = {
  _id: 1,
  name: 1,
  email: 1,
  profilePhoto: 1,
  isActive: 1,
  createdAt: 1,
};
const LIKE_USER_PROJECTION = {
  _id: 1,
  name: 1,
  email: 1,
  profilePhoto: 1,
  isActive: 1,
  createdAt: 1,
};

const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastSevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { now, today, month, lastSevenDays };
};

const parseDate = (value) => {
  if (!DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

const parsePositiveInteger = (value, fallback, maximum) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed >= 1 && parsed <= maximum ? parsed : null;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isObjectId = (value) => OBJECT_ID_PATTERN.test(value) && mongoose.Types.ObjectId.isValid(value);

const getLikeDetailsStages = () => [
  {
    $lookup: {
      from: Like.collection.name,
      let: { fromUser: '$fromUser', toUser: '$toUser' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$fromUser', '$$toUser'] },
                { $eq: ['$toUser', '$$fromUser'] },
                { $eq: ['$type', 'like'] },
              ],
            },
          },
        },
        { $project: { _id: 1, createdAt: 1 } },
        { $limit: 1 },
      ],
      as: 'reciprocalLike',
    },
  },
  {
    $lookup: {
      from: User.collection.name,
      localField: 'fromUser',
      foreignField: '_id',
      pipeline: [{ $project: LIKE_USER_PROJECTION }],
      as: 'senderUser',
    },
  },
  {
    $lookup: {
      from: User.collection.name,
      localField: 'toUser',
      foreignField: '_id',
      pipeline: [{ $project: LIKE_USER_PROJECTION }],
      as: 'recipientUser',
    },
  },
  {
    $lookup: {
      from: Match.collection.name,
      let: { fromUser: '$fromUser', toUser: '$toUser' },
      pipeline: [
        {
          $match: {
            $expr: { $setEquals: ['$users', ['$$fromUser', '$$toUser']] },
          },
        },
        { $project: { _id: 1, createdAt: 1 } },
        { $limit: 1 },
      ],
      as: 'relatedMatch',
    },
  },
  {
    $addFields: {
      sender: { $ifNull: [{ $arrayElemAt: ['$senderUser', 0] }, null] },
      recipient: { $ifNull: [{ $arrayElemAt: ['$recipientUser', 0] }, null] },
      reciprocal: { $ifNull: [{ $arrayElemAt: ['$reciprocalLike', 0] }, null] },
      match: { $ifNull: [{ $arrayElemAt: ['$relatedMatch', 0] }, null] },
      accountsAvailable: {
        $and: [
          { $eq: [{ $size: '$senderUser' }, 1] },
          { $eq: [{ $size: '$recipientUser' }, 1] },
          { $ne: [{ $ifNull: [{ $arrayElemAt: ['$senderUser.isActive', 0] }, false] }, false] },
          { $ne: [{ $ifNull: [{ $arrayElemAt: ['$recipientUser.isActive', 0] }, false] }, false] },
        ],
      },
    },
  },
  {
    $addFields: {
      likeStatus: {
        $cond: [
          { $eq: ['$accountsAvailable', false] },
          'unavailable',
          { $cond: [{ $ne: ['$reciprocal', null] }, 'mutual', 'pending'] },
        ],
      },
    },
  },
];

const getLikeSummaryStages = ({ now, today, month }) => [
  { $match: { type: 'like' } },
  ...getLikeDetailsStages(),
  {
    $group: {
      _id: null,
      totalLikesSent: { $sum: 1 },
      likesReceived: { $sum: 1 },
      oneSidedLikes: {
        $sum: { $cond: [{ $eq: ['$reciprocal', null] }, 1, 0] },
      },
      mutualLikes: {
        $sum: {
          $cond: [
            {
              $and: [
                { $ne: ['$reciprocal', null] },
                { $lt: ['$fromUser', '$toUser'] },
              ],
            },
            1,
            0,
          ],
        },
      },
      pendingLikes: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ['$reciprocal', null] },
                { $eq: ['$accountsAvailable', true] },
              ],
            },
            1,
            0,
          ],
        },
      },
      todayLikes: {
        $sum: {
          $cond: [
            { $and: [{ $gte: ['$createdAt', today] }, { $lte: ['$createdAt', now] }] },
            1,
            0,
          ],
        },
      },
      monthLikes: {
        $sum: {
          $cond: [
            { $and: [{ $gte: ['$createdAt', month] }, { $lte: ['$createdAt', now] }] },
            1,
            0,
          ],
        },
      },
    },
  },
];

const getParticipantStatusStages = () => [
  {
    $lookup: {
      from: User.collection.name,
      localField: 'users',
      foreignField: '_id',
      pipeline: [{ $project: { _id: 1, isActive: 1 } }],
      as: 'statusParticipants',
    },
  },
  {
    $addFields: {
      status: {
        $cond: [
          {
            $and: [
              { $eq: [{ $size: { $ifNull: ['$users', []] } }, 2] },
              { $eq: [{ $size: '$statusParticipants' }, 2] },
              {
                $allElementsTrue: {
                  $map: {
                    input: '$statusParticipants',
                    as: 'participant',
                    in: { $ne: [{ $ifNull: ['$$participant.isActive', true] }, false] },
                  },
                },
              },
            ],
          },
          'active',
          'unavailable',
        ],
      },
    },
  },
];

router.get('/summary', async (req, res) => {
  try {
    const { now, today, month, lastSevenDays } = getDateRanges();
    const [total, todayCount, monthCount, lastSevenDaysCount, activeMatches, unmatchedMutualLikes] = await Promise.all([
      Match.countDocuments(),
      Match.countDocuments({ createdAt: { $gte: today, $lte: now } }),
      Match.countDocuments({ createdAt: { $gte: month, $lte: now } }),
      Match.countDocuments({ createdAt: { $gte: lastSevenDays, $lte: now } }),
      Match.aggregate([
        ...getParticipantStatusStages(),
        { $match: { status: 'active' } },
        { $count: 'total' },
      ]),
      Like.aggregate([
        { $match: { type: 'like' } },
        { $match: { $expr: { $lt: ['$fromUser', '$toUser'] } } },
        {
          $lookup: {
            from: Like.collection.name,
            let: { fromUser: '$fromUser', toUser: '$toUser' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$fromUser', '$$toUser'] },
                      { $eq: ['$toUser', '$$fromUser'] },
                      { $eq: ['$type', 'like'] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'reciprocalLike',
          },
        },
        { $match: { $expr: { $gt: [{ $size: '$reciprocalLike' }, 0] } } },
        {
          $lookup: {
            from: Match.collection.name,
            let: { fromUser: '$fromUser', toUser: '$toUser' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$$fromUser', { $ifNull: ['$users', []] }] },
                      { $in: ['$$toUser', { $ifNull: ['$users', []] }] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'establishedMatch',
          },
        },
        { $match: { $expr: { $eq: [{ $size: '$establishedMatch' }, 0] } } },
        { $count: 'total' },
      ]),
    ]);

    return res.json({
      success: true,
      summary: {
        total,
        today: todayCount,
        thisMonth: monthCount,
        active: activeMatches[0]?.total || 0,
        lastSevenDays: lastSevenDaysCount,
        unmatchedMutualLikes: unmatchedMutualLikes[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Get admin match summary error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load match summary' });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, MAX_PAGE);
    const limit = parsePositiveInteger(req.query.limit, 20, MAX_PAGE_SIZE);
    const { search = '', from, to, status = 'all', conversation = 'all', sort = 'newest' } = req.query;

    if (page === null || limit === null) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    }
    if (typeof search !== 'string' || search.length > 100) {
      return res.status(400).json({ success: false, message: 'Search must be 100 characters or fewer' });
    }
    if (typeof status !== 'string' || !['all', 'active', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid match status filter' });
    }
    if (typeof conversation !== 'string' || !['all', 'yes', 'no'].includes(conversation)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation filter' });
    }
    if (typeof sort !== 'string' || !['newest', 'oldest', 'activity'].includes(sort)) {
      return res.status(400).json({ success: false, message: 'Invalid sort option' });
    }
    if (from !== undefined && typeof from !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid start date' });
    }
    if (to !== undefined && typeof to !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid end date' });
    }

    const startDate = from ? parseDate(from) : null;
    const endDate = to ? parseDate(to) : null;
    if ((from && !startDate) || (to && !endDate)) {
      return res.status(400).json({ success: false, message: 'Dates must be valid YYYY-MM-DD values' });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) {
        const exclusiveEndDate = new Date(endDate);
        exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
        matchStage.createdAt.$lt = exclusiveEndDate;
      }
    }

    const escapedSearch = search.trim() ? escapeRegex(search.trim()) : null;
    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: User.collection.name,
          localField: 'users',
          foreignField: '_id',
          pipeline: [{ $project: USER_PROJECTION }],
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
      ...getParticipantStatusStages(),
      {
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
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, createdAt: 1 } },
          ],
          as: 'latestMessage',
        },
      },
      {
        $addFields: {
          hasConversation: { $gt: [{ $size: '$latestMessage' }, 0] },
          lastActivity: { $arrayElemAt: ['$latestMessage.createdAt', 0] },
        },
      },
    ];

    if (escapedSearch) {
      const searchRegex = { $regex: escapedSearch, $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: '$_id' },
                    regex: escapedSearch,
                    options: 'i',
                  },
                },
              },
            { 'participants.name': searchRegex },
            { 'participants.email': searchRegex },
          ],
        },
      });
    }
    if (status !== 'all') pipeline.push({ $match: { status } });
    if (conversation !== 'all') {
      pipeline.push({ $match: { hasConversation: conversation === 'yes' } });
    }

    const sortStage = sort === 'oldest'
      ? { createdAt: 1 }
      : sort === 'activity'
        ? { lastActivity: -1, createdAt: -1 }
        : { createdAt: -1 };
    pipeline.push({
      $facet: {
        matches: [
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              status: 1,
              hasConversation: 1,
              lastActivity: 1,
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
      matches: result?.matches || [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin matches error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load matches' });
  }
});

router.get('/likes/summary', async (req, res) => {
  try {
    const { now, today, month } = getDateRanges();
    const [summary] = await Like.aggregate(getLikeSummaryStages({ now, today, month }));
    return res.json({
      success: true,
      summary: {
        totalLikesSent: summary?.totalLikesSent || 0,
        likesReceived: summary?.likesReceived || 0,
        oneSidedLikes: summary?.oneSidedLikes || 0,
        mutualLikes: summary?.mutualLikes || 0,
        pendingLikes: summary?.pendingLikes || 0,
        todayLikes: summary?.todayLikes || 0,
        monthLikes: summary?.monthLikes || 0,
      },
    });
  } catch (error) {
    console.error('Get admin like summary error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load like summary' });
  }
});

router.get('/likes', async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, MAX_PAGE);
    const limit = parsePositiveInteger(req.query.limit, 20, MAX_PAGE_SIZE);
    const {
      search = '',
      from,
      to,
      status = 'all',
      sentBy,
      receivedBy,
      sort = 'newest',
    } = req.query;

    if (page === null || limit === null) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    }
    if (typeof search !== 'string' || search.length > 100) {
      return res.status(400).json({ success: false, message: 'Search must be 100 characters or fewer' });
    }
    if (!['all', 'pending', 'mutual', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid like status filter' });
    }
    if (!['newest', 'oldest'].includes(sort)) {
      return res.status(400).json({ success: false, message: 'Invalid like sort option' });
    }
    if (from !== undefined && typeof from !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid start date' });
    }
    if (to !== undefined && typeof to !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid end date' });
    }
    if ((sentBy !== undefined && (typeof sentBy !== 'string' || !isObjectId(sentBy)))
      || (receivedBy !== undefined && (typeof receivedBy !== 'string' || !isObjectId(receivedBy)))) {
      return res.status(400).json({ success: false, message: 'Sender and recipient filters must be valid user IDs' });
    }

    const startDate = from ? parseDate(from) : null;
    const endDate = to ? parseDate(to) : null;
    if ((from && !startDate) || (to && !endDate)) {
      return res.status(400).json({ success: false, message: 'Dates must be valid YYYY-MM-DD values' });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const initialMatch = { type: 'like' };
    if (sentBy) initialMatch.fromUser = new mongoose.Types.ObjectId(sentBy);
    if (receivedBy) initialMatch.toUser = new mongoose.Types.ObjectId(receivedBy);
    if (startDate || endDate) {
      initialMatch.createdAt = {};
      if (startDate) initialMatch.createdAt.$gte = startDate;
      if (endDate) {
        const exclusiveEndDate = new Date(endDate);
        exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
        initialMatch.createdAt.$lt = exclusiveEndDate;
      }
    }

    const pipeline = [{ $match: initialMatch }, ...getLikeDetailsStages()];
    const escapedSearch = search.trim() ? escapeRegex(search.trim()) : null;
    if (escapedSearch) {
      const searchRegex = { $regex: escapedSearch, $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
            { 'sender.name': searchRegex },
            { 'sender.email': searchRegex },
            { 'recipient.name': searchRegex },
            { 'recipient.email': searchRegex },
            { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: escapedSearch, options: 'i' } } },
            { $expr: { $regexMatch: { input: { $toString: '$fromUser' }, regex: escapedSearch, options: 'i' } } },
            { $expr: { $regexMatch: { input: { $toString: '$toUser' }, regex: escapedSearch, options: 'i' } } },
          ],
        },
      });
    }
    if (status !== 'all') pipeline.push({ $match: { likeStatus: status } });
    pipeline.push({
      $facet: {
        likes: [
          { $sort: { createdAt: sort === 'oldest' ? 1 : -1, _id: sort === 'oldest' ? 1 : -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              fromUser: 1,
              toUser: 1,
              createdAt: 1,
              likeStatus: 1,
              sender: 1,
              recipient: 1,
              reciprocalLike: '$reciprocal',
              relatedMatch: '$match',
              accountsAvailable: 1,
            },
          },
        ],
        metadata: [{ $count: 'total' }],
      },
    });

    const [result] = await Like.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    return res.json({
      success: true,
      likes: result?.likes || [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin likes error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load likes' });
  }
});

router.get('/likes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid like ID' });
    }

    const [like] = await Like.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), type: 'like' } },
      ...getLikeDetailsStages(),
      {
        $project: {
          _id: 1,
          fromUser: 1,
          toUser: 1,
          createdAt: 1,
          likeStatus: 1,
          sender: 1,
          recipient: 1,
          reciprocalLike: '$reciprocal',
          relatedMatch: '$match',
          accountsAvailable: 1,
        },
      },
    ]);

    if (!like) return res.status(404).json({ success: false, message: 'Like not found' });

    const interactionHistory = [{
      likeId: like._id,
      senderId: like.fromUser,
      recipientId: like.toUser,
      createdAt: like.createdAt,
    }];
    if (like.reciprocalLike) {
      interactionHistory.push({
        likeId: like.reciprocalLike._id,
        senderId: like.toUser,
        recipientId: like.fromUser,
        createdAt: like.reciprocalLike.createdAt,
      });
    }

    return res.json({
      success: true,
      like: {
        ...like,
        accountStatus: {
          sender: !like.sender ? 'deleted' : like.sender.isActive === false ? 'inactive' : 'active',
          recipient: !like.recipient ? 'deleted' : like.recipient.isActive === false ? 'inactive' : 'active',
        },
        interactionHistory,
      },
    });
  } catch (error) {
    console.error('Get admin like details error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load like details' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!OBJECT_ID_PATTERN.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid match ID' });
    }

    const match = await Match.findById(id)
      .select('_id users createdAt')
      .populate({
        path: 'users',
        select: '_id name profilePhoto isActive createdAt',
      })
      .lean();

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const participantIds = match.users || [];
    let latestMessage = null;
    if (participantIds.length === 2 && participantIds[0] && participantIds[1]) {
      latestMessage = await Message.findOne({
        $or: [
          { sender: participantIds[0]._id, receiver: participantIds[1]._id },
          { sender: participantIds[1]._id, receiver: participantIds[0]._id },
        ],
      })
        .select('createdAt')
        .sort({ createdAt: -1 })
        .lean();
    }

    const registeredCount = participantIds.filter(Boolean).length;
    const activeCount = participantIds.filter((participant) => participant && participant.isActive !== false).length;
    return res.json({
      success: true,
      match: {
        _id: match._id,
        createdAt: match.createdAt,
        status: registeredCount === 2 && activeCount === 2 ? 'active' : 'unavailable',
        participants: participantIds.map((participant) => participant && ({
          _id: participant._id,
          name: participant.name || 'Unavailable user',
          profilePhoto: participant.profilePhoto || '',
          isActive: participant.isActive !== false,
          registered: true,
        })),
        hasConversation: Boolean(latestMessage),
        lastActivity: latestMessage?.createdAt || null,
      },
    });
  } catch (error) {
    console.error('Get admin match details error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load match details' });
  }
});

module.exports = router;
