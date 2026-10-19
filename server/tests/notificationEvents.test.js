const {
  buildNotificationPayload,
  emitNotification,
  emitNotificationChange,
} = require('../utils/notificationEvents');

describe('notification socket events', () => {
  const notification = {
    _id: 'notification-id',
    user: 'recipient-id',
    type: 'message',
    title: 'New Message',
    message: 'Someone sent you a message',
    relatedUser: {
      _id: 'sender-id',
      name: 'Sender',
      profilePhoto: 'https://images.example/sender.jpg',
      email: 'private@example.com',
    },
    relatedMatch: 'match-id',
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-10-19T00:00:00.000Z'),
    password: 'never-send-this',
    token: 'never-send-this-either',
  };

  it('sends only safe notification fields and selected related-user details', () => {
    expect(buildNotificationPayload(notification)).toEqual({
      _id: 'notification-id',
      type: 'message',
      title: 'New Message',
      message: 'Someone sent you a message',
      relatedUser: {
        _id: 'sender-id',
        name: 'Sender',
        profilePhoto: 'https://images.example/sender.jpg',
      },
      relatedMatch: 'match-id',
      isRead: false,
      readAt: null,
      createdAt: notification.createdAt,
    });
  });

  it('emits newly created notifications only to the recipient room', async () => {
    const emit = jest.fn();
    const room = { emit };
    const io = { to: jest.fn(() => room) };
    const populatedNotification = {
      ...notification,
      populate: jest.fn().mockResolvedValue(undefined),
    };

    await emitNotification(io, populatedNotification);

    expect(populatedNotification.populate).toHaveBeenCalledWith('relatedUser', 'name profilePhoto');
    expect(io.to).toHaveBeenCalledWith('recipient-id');
    expect(emit).toHaveBeenCalledWith('notification', buildNotificationPayload(notification));
  });

  it('sends notification state changes to only the recipient room', () => {
    const emit = jest.fn();
    const io = { to: jest.fn(() => ({ emit })) };
    const payload = { id: 'notification-id', unreadCount: 0 };

    emitNotificationChange(io, 'recipient-id', 'notification:read', payload);

    expect(io.to).toHaveBeenCalledWith('recipient-id');
    expect(emit).toHaveBeenCalledWith('notification:read', payload);
  });
});
