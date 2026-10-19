const buildNotificationPayload = (notification) => {
  const relatedUser = notification.relatedUser;
  return {
    _id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedUser: relatedUser && typeof relatedUser === 'object' && relatedUser._id
      ? {
          _id: relatedUser._id.toString(),
          name: relatedUser.name,
          profilePhoto: relatedUser.profilePhoto,
        }
      : relatedUser?.toString(),
    relatedMatch: notification.relatedMatch?.toString(),
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
};

const emitNotification = async (io, notification) => {
  if (!io || !notification) return;
  const userId = notification.user?._id || notification.user;
  if (!userId) return;

  try {
    await notification.populate('relatedUser', 'name profilePhoto');
    io.to(userId.toString()).emit('notification', buildNotificationPayload(notification));
  } catch (error) {
    console.error('Notification socket delivery failed:', {
      notificationId: notification._id?.toString(),
      userId: userId.toString(),
      error: error.message,
    });
  }
};

const emitNotificationChange = (io, userId, event, payload) => {
  if (io && userId) io.to(userId.toString()).emit(event, payload);
};

module.exports = { buildNotificationPayload, emitNotification, emitNotificationChange };
