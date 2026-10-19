jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '64b000000000000000000001' };
    next();
  },
}));

jest.mock('../models/Notification', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const express = require('express');
const Notification = require('../models/Notification');
const notificationsRouter = require('../routes/notifications');

describe('authenticated notification routes', () => {
  let server;
  let baseUrl;
  let emit;
  let io;
  const userId = '64b000000000000000000001';
  const notificationId = '64b000000000000000000002';

  beforeEach(async () => {
    jest.clearAllMocks();
    emit = jest.fn();
    io = { to: jest.fn(() => ({ emit })) };
    const app = express();
    app.set('io', io);
    app.use('/api/notifications', notificationsRouter);
    server = await new Promise((resolve) => {
      const listeningServer = app.listen(0, () => resolve(listeningServer));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/notifications`;
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('lists only the authenticated user’s notifications and unread count', async () => {
    const rows = [{ _id: notificationId, title: 'New message' }];
    const query = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(rows),
    };
    Notification.find.mockReturnValue(query);
    Notification.countDocuments.mockResolvedValue(4);

    const response = await fetch(baseUrl);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.notifications).toEqual(rows);
    expect(body.unreadCount).toBe(4);
    expect(Notification.find).toHaveBeenCalledWith({ user: userId });
    expect(Notification.countDocuments).toHaveBeenCalledWith({ user: userId, isRead: false });
    expect(query.select).toHaveBeenCalledWith('type title message relatedUser relatedMatch isRead readAt createdAt');
  });

  it('rejects invalid pagination and notification IDs before querying records', async () => {
    const pageResponse = await fetch(`${baseUrl}?page=0`);
    const idResponse = await fetch(`${baseUrl}/invalid/read`, { method: 'PUT' });

    expect(pageResponse.status).toBe(400);
    expect(idResponse.status).toBe(400);
    expect(Notification.find).not.toHaveBeenCalled();
    expect(Notification.findOne).not.toHaveBeenCalled();
  });

  it('marks a notification as read for its owner and broadcasts the new count', async () => {
    const notification = {
      _id: { toString: () => notificationId },
      isRead: false,
      markAsRead: jest.fn().mockResolvedValue(undefined),
    };
    Notification.findOne.mockResolvedValue(notification);
    Notification.countDocuments.mockResolvedValue(2);

    const response = await fetch(`${baseUrl}/${notificationId}/read`, { method: 'PUT' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.unreadCount).toBe(2);
    expect(Notification.findOne).toHaveBeenCalledWith({ _id: notificationId, user: userId });
    expect(notification.markAsRead).toHaveBeenCalled();
    expect(io.to).toHaveBeenCalledWith(userId);
    expect(emit).toHaveBeenCalledWith('notification:read', { id: notificationId, unreadCount: 2 });
  });

  it('marks all notifications as read only for the authenticated user', async () => {
    Notification.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const response = await fetch(`${baseUrl}/read-all`, { method: 'PUT' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.unreadCount).toBe(0);
    expect(Notification.updateMany).toHaveBeenCalledWith(
      { user: userId, isRead: false },
      { isRead: true, readAt: expect.any(Date) },
    );
    expect(emit).toHaveBeenCalledWith('notification:read-all', { unreadCount: 0 });
  });

  it('deletes a notification only for the authenticated user and synchronizes its count', async () => {
    Notification.findOneAndDelete.mockResolvedValue({
      _id: { toString: () => notificationId },
      isRead: false,
    });
    Notification.countDocuments.mockResolvedValue(1);

    const response = await fetch(`${baseUrl}/${notificationId}`, { method: 'DELETE' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.unreadCount).toBe(1);
    expect(Notification.findOneAndDelete).toHaveBeenCalledWith({ _id: notificationId, user: userId });
    expect(emit).toHaveBeenCalledWith('notification:deleted', { id: notificationId, unreadCount: 1 });
  });
});
