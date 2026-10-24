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
  findById: jest.fn(),
}));

jest.mock('../models/User', () => ({
  collection: { name: 'users' },
}));

jest.mock('../models/Message', () => ({
  collection: { name: 'messages' },
  findOne: jest.fn(),
}));

jest.mock('../models/Like', () => ({
  collection: { name: 'likes' },
  aggregate: jest.fn(),
}));

const express = require('express');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Like = require('../models/Like');
const { protect, authorize } = require('../middleware/auth');
const adminMatchesRouter = require('../routes/adminMatches');

describe('admin match tracking routes', () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRole = 'admin';
    const app = express();
    app.use('/api/admin/matches', protect, authorize('admin'), adminMatchesRouter);
    server = await new Promise((resolve) => {
      const listeningServer = app.listen(0, () => resolve(listeningServer));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/admin/matches`;
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('returns database-backed match totals and an empty active count', async () => {
    Match.countDocuments
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3);
    Match.aggregate.mockResolvedValue([]);
    Like.aggregate.mockResolvedValue([{ total: 4 }]);

    const response = await fetch(`${baseUrl}/summary`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary).toEqual({
      total: 12,
      today: 2,
      thisMonth: 5,
      active: 0,
      lastSevenDays: 3,
      unmatchedMutualLikes: 4,
    });
    expect(Match.countDocuments).toHaveBeenCalledTimes(4);
    expect(Match.countDocuments).toHaveBeenNthCalledWith(1);
  });

  it('returns server-paginated rows and applies escaped search filters', async () => {
    Match.aggregate.mockResolvedValue([{
      matches: [{ _id: 'match-id', participants: [{ name: 'Alice' }, { name: 'Bob' }] }],
      metadata: [{ total: 1 }],
    }]);

    const response = await fetch(`${baseUrl}?search=alice.*&page=2&limit=10&status=active&conversation=yes&sort=activity&from=2026-01-01&to=2026-01-03`);
    const body = await response.json();
    const pipeline = Match.aggregate.mock.calls[0][0];

    expect(response.status).toBe(200);
    expect(body.pagination).toEqual({ page: 2, limit: 10, total: 1, pages: 1 });
    expect(body.matches).toHaveLength(1);
    expect(JSON.stringify(pipeline)).toContain('alice\\\\.\\\\*');
    expect(JSON.stringify(pipeline)).toContain('"hasConversation":true');
    expect(JSON.stringify(pipeline)).toContain('"lastActivity":-1');
  });

  it('rejects invalid pagination and IDs before querying records', async () => {
    const pageResponse = await fetch(`${baseUrl}?page=0`);
    const idResponse = await fetch(`${baseUrl}/not-an-object-id`);

    expect(pageResponse.status).toBe(400);
    expect(idResponse.status).toBe(400);
    expect(Match.aggregate).not.toHaveBeenCalled();
    expect(Match.findById).not.toHaveBeenCalled();
  });

  it('requires an administrator for every match endpoint', async () => {
    mockRole = 'user';
    const response = await fetch(`${baseUrl}/summary`);

    expect(response.status).toBe(403);
    expect(Match.countDocuments).not.toHaveBeenCalled();
  });

  it('returns database-backed like totals with mutual pairs counted once', async () => {
    Like.aggregate.mockResolvedValue([{
      totalLikesSent: 8,
      likesReceived: 8,
      oneSidedLikes: 4,
      mutualLikes: 2,
      pendingLikes: 3,
      todayLikes: 1,
      monthLikes: 5,
    }]);

    const response = await fetch(`${baseUrl}/likes/summary`);
    const body = await response.json();
    const pipeline = Like.aggregate.mock.calls[0][0];

    expect(response.status).toBe(200);
    expect(body.summary).toEqual({
      totalLikesSent: 8,
      likesReceived: 8,
      oneSidedLikes: 4,
      mutualLikes: 2,
      pendingLikes: 3,
      todayLikes: 1,
      monthLikes: 5,
    });
    expect(JSON.stringify(pipeline)).toContain('"type":"like"');
    expect(JSON.stringify(pipeline)).toContain('"mutualLikes"');
  });

  it('server-paginates and combines like filters', async () => {
    Like.aggregate.mockResolvedValue([{
      likes: [{ _id: 'like-id', likeStatus: 'pending' }],
      metadata: [{ total: 1 }],
    }]);

    const response = await fetch(`${baseUrl}/likes?search=alice&sentBy=64b000000000000000000011&status=pending&page=2&limit=10&sort=oldest&from=2026-01-01&to=2026-01-03`);
    const body = await response.json();
    const pipeline = JSON.stringify(Like.aggregate.mock.calls[0][0]);

    expect(response.status).toBe(200);
    expect(body.likes).toHaveLength(1);
    expect(body.pagination).toEqual({ page: 2, limit: 10, total: 1, pages: 1 });
    expect(pipeline).toContain('"fromUser":"64b000000000000000000011"');
    expect(pipeline).toContain('"likeStatus":"pending"');
    expect(pipeline).toContain('"createdAt":1');
  });

  it('rejects invalid like filters and protects like endpoints', async () => {
    const invalidId = await fetch(`${baseUrl}/likes?sentBy=not-an-object-id`);
    mockRole = 'user';
    const forbidden = await fetch(`${baseUrl}/likes/summary`);

    expect(invalidId.status).toBe(400);
    expect(forbidden.status).toBe(403);
    expect(Like.aggregate).not.toHaveBeenCalled();
  });

  it('returns like details and reciprocal history without credentials', async () => {
    Like.aggregate.mockResolvedValue([{
      _id: '64b000000000000000000099',
      fromUser: '64b000000000000000000011',
      toUser: '64b000000000000000000012',
      createdAt: '2026-01-02T00:00:00.000Z',
      likeStatus: 'mutual',
      sender: { _id: '64b000000000000000000011', name: 'Alice', isActive: true },
      recipient: { _id: '64b000000000000000000012', name: 'Bob', isActive: true },
      reciprocalLike: { _id: '64b000000000000000000098', createdAt: '2026-01-03T00:00:00.000Z' },
      relatedMatch: { _id: '64b000000000000000000097', createdAt: '2026-01-03T00:00:00.000Z' },
      accountsAvailable: true,
    }]);

    const response = await fetch(`${baseUrl}/likes/64b000000000000000000099`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.like.likeStatus).toBe('mutual');
    expect(body.like.interactionHistory).toHaveLength(2);
    expect(body.like.relatedMatch._id).toBe('64b000000000000000000097');
    expect(JSON.stringify(body)).not.toMatch(/password|token|secret/i);
  });

  it('returns match details without private message contents', async () => {
    const userA = { _id: '64b000000000000000000011', name: 'Alice', isActive: true };
    const userB = { _id: '64b000000000000000000012', name: 'Bob', isActive: true };
    Match.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        _id: '64b000000000000000000099',
        users: [userA, userB],
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
    });
    Message.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        createdAt: '2026-01-03T00:00:00.000Z',
        content: 'must not be returned',
      }),
    });

    const response = await fetch(`${baseUrl}/64b000000000000000000099`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.match.status).toBe('active');
    expect(body.match.hasConversation).toBe(true);
    expect(JSON.stringify(body)).not.toContain('must not be returned');
    expect(body.match.participants).toHaveLength(2);
  });
});
