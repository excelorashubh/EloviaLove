let mockRole = 'admin';

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '64b000000000000000000001', role: mockRole };
    next();
  },
  authorize: (...roles) => (req, res, next) => (
    roles.includes(req.user?.role)
      ? next()
      : res.status(403).json({ success: false, message: 'Admin access required' })
  ),
}));

jest.mock('../models/Match', () => ({
  collection: { name: 'matches' },
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock('../models/Message', () => ({
  collection: { name: 'messages' },
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock('../models/User', () => ({
  collection: { name: 'users' },
}));

const express = require('express');
const Match = require('../models/Match');
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');
const adminChatsRouter = require('../routes/adminChats');

describe('admin chat tracking routes', () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRole = 'admin';
    const app = express();
    app.use('/api/admin/chats', protect, authorize('admin'), adminChatsRouter);
    server = await new Promise((resolve) => {
      const listeningServer = app.listen(0, () => resolve(listeningServer));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/admin/chats`;
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('calculates summary statistics from matches and persisted message records', async () => {
    Match.countDocuments.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    Message.countDocuments.mockResolvedValueOnce(20).mockResolvedValueOnce(3).mockResolvedValueOnce(5);
    Match.aggregate.mockResolvedValue([{ total: 2 }]);
    Message.aggregate.mockResolvedValue([{ total: 3 }]);

    const response = await fetch(`${baseUrl}/summary`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary).toEqual({
      totalConversations: 4,
      activeConversations: 2,
      todayChats: 1,
      messagesToday: 3,
      totalMessages: 20,
      unreadMessages: 5,
      activeChatters: 3,
      activeChattersPeriodDays: 30,
      averageMessagesPerConversation: 5,
    });
  });

  it('returns metadata-only conversation rows with server pagination', async () => {
    Match.aggregate.mockResolvedValue([{
      conversations: [{ _id: 'conversation-id', messageCount: 8, unreadCount: 2 }],
      metadata: [{ total: 1 }],
    }]);

    const response = await fetch(`${baseUrl}?page=2&limit=10&search=alice.*&status=active&sort=messages&from=2026-01-01&activityTo=2026-01-31`);
    const body = await response.json();
    const pipeline = Match.aggregate.mock.calls[0][0];

    expect(response.status).toBe(200);
    expect(body.pagination).toEqual({ page: 2, limit: 10, total: 1, pages: 1 });
    expect(JSON.stringify(pipeline)).toContain('alice\\\\.\\\\*');
    expect(JSON.stringify(pipeline)).not.toContain('content');
  });

  it('validates pagination, analytics ranges, and IDs before querying', async () => {
    const pageResponse = await fetch(`${baseUrl}?limit=0`);
    const analyticsResponse = await fetch(`${baseUrl}/analytics?days=31`);
    const idResponse = await fetch(`${baseUrl}/not-an-object-id`);

    expect(pageResponse.status).toBe(400);
    expect(analyticsResponse.status).toBe(400);
    expect(idResponse.status).toBe(400);
    expect(Match.aggregate).not.toHaveBeenCalled();
  });

  it('requires administrator authorization', async () => {
    mockRole = 'user';
    const response = await fetch(`${baseUrl}/summary`);

    expect(response.status).toBe(403);
    expect(Match.countDocuments).not.toHaveBeenCalled();
    expect(Message.countDocuments).not.toHaveBeenCalled();
  });

  it('returns conversation details without private message bodies', async () => {
    Match.aggregate.mockResolvedValue([{
      _id: '64b000000000000000000099',
      participants: [
        { _id: '64b000000000000000000011', name: 'Alice', isActive: true },
        { _id: '64b000000000000000000012', name: 'Bob', isActive: true },
      ],
      messageCount: 5,
      unreadCount: 1,
      privateContent: 'must not be returned',
    }]);

    const response = await fetch(`${baseUrl}/64b000000000000000000099`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.conversation.messageCount).toBe(5);
    expect(JSON.stringify(body)).not.toContain('must not be returned');
    expect(JSON.stringify(Match.aggregate.mock.calls[0][0])).not.toContain('content');
  });
});
