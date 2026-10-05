const mongoose = require('mongoose');
const User = require('../models/User');
const randomVideoMonitor = require('./randomVideoMonitor');

class RandomMatchManager {
  constructor() {
    this.queue = [];
    this.sessions = new Map();
    this.userSessions = new Map();
    this.stats = {
      totalRandomCalls: 0,
      activeCalls: 0,
      queueSize: 0,
      cardsUsed: 0,
      coinsSpent: 0,
      totalMinutesUsed: 0,
      reports: 0,
      blockedUsers: 0,
      onlineUsers: 0,
      liveMonitoring: []
    };
    this.monitoringWindow = [];
  }

  async startSearch(userDoc, io) {
    const userId = userDoc._id.toString();
    const existing = this.userSessions.get(userId);
    if (existing && ['searching', 'matched', 'active'].includes(existing.status)) {
      return { success: true, status: existing.status, session: existing, message: 'Search already in progress' };
    }

    if (!userDoc.profileCompleted) {
      return { success: false, message: 'Please complete your profile before random matching.' };
    }

    if (userDoc.isActive === false) {
      return { success: false, message: 'Your account is currently inactive.' };
    }

    if (userDoc.randomMatchCards <= 0 && userDoc.coins < 100) {
      return { success: false, message: 'You need free cards or coins to start a random match.' };
    }

    const queuedUser = this.queue.find(item => item.userId === userId);
    if (queuedUser) {
      this.queue = this.queue.filter(item => item.userId !== userId);
    }

    const candidate = this.queue.find(item => item.userId !== userId && this.isCompatible(userDoc, item.profile));
    if (candidate) {
      this.queue = this.queue.filter(item => item.userId !== candidate.userId);
      const session = this.createSession(userDoc, candidate.profile, io);
      this.userSessions.set(userId, session);
      this.userSessions.set(candidate.userId, session);
      this.stats.activeCalls += 1;
      this.stats.totalRandomCalls += 1;
      this.stats.queueSize = Math.max(0, this.queue.length);
      randomVideoMonitor.addEvent('match_found', {
        userId,
        partnerId: candidate.userId,
        sessionId: session.id,
      });
      io.to(userId).emit('matchFound', { session, partner: candidate.profile });
      io.to(candidate.userId).emit('matchFound', { session, partner: this.getPublicProfile(userDoc) });
      return { success: true, status: 'matched', session, partner: candidate.profile };
    }

    const entry = {
      userId,
      socketId: null,
      profile: this.getPublicProfile(userDoc),
      joinedAt: new Date(),
      attemptedAt: new Date()
    };
    this.queue.push(entry);
    this.stats.queueSize = this.queue.length;
    randomVideoMonitor.addEvent('queue_joined', {
      userId,
      queueSize: this.queue.length,
    });
    return { success: true, status: 'searching', message: 'Finding your perfect match...' };
  }

  async skipSearch(userId, io) {
    const session = this.userSessions.get(userId);
    if (session) {
      randomVideoMonitor.addEvent('session_skipped', {
        userId,
        sessionId: session.id,
      });
      this.endSession(userId, io, 'skipped');
      return { success: true, message: 'Match skipped. Searching again...' };
    }

    this.queue = this.queue.filter(item => item.userId !== userId);
    this.stats.queueSize = this.queue.length;
    randomVideoMonitor.addEvent('queue_left', {
      userId,
      queueSize: this.queue.length,
    });
    return { success: true, message: 'Search canceled.' };
  }

  async endCall(userId, io) {
    const session = this.userSessions.get(userId);
    if (!session) {
      return { success: false, message: 'No active match found.' };
    }

    this.endSession(userId, io, 'ended');
    return { success: true, message: 'Call ended.' };
  }

  async getStatus(userId) {
    return { success: true, status: this.userSessions.get(userId) || null };
  }

  async getCards(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    return {
      success: true,
      randomMatchCards: user.randomMatchCards || 0,
      giftClaimed: user.giftClaimed || false,
      coins: user.coins || 0
    };
  }

  async reportUser(userId, targetId, reason, io) {
    const targetUser = await User.findById(targetId);
    if (!targetUser) return { success: false, message: 'User not found.' };
    this.stats.reports += 1;
    randomVideoMonitor.addEvent('report_submitted', {
      reporterId: userId,
      targetId,
      reason,
    });
    if (io) {
      io.to(targetId).emit('randomMatchReport', { targetId, reason });
    }
    return { success: true, message: 'Report received. Our moderation team will review it.' };
  }

  async blockUser(userId, targetId, io) {
    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetId);
    if (!currentUser || !targetUser) return { success: false, message: 'User not found.' };
    if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
    if (!currentUser.blockedUsers.some(id => id.toString() === targetId)) {
      currentUser.blockedUsers.push(targetUser._id);
      await currentUser.save({ validateBeforeSave: false });
    }
    this.stats.blockedUsers += 1;
    randomVideoMonitor.addEvent('user_blocked', {
      userId,
      targetId,
    });
    if (io) {
      io.to(userId).emit('randomMatchBlocked', { targetId });
    }
    return { success: true, message: 'User blocked.' };
  }

  async recharge(userId, payload, io) {
    const { type = 'coins', amount = 1000 } = payload || {};
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found.' };

    if (type === 'gift') {
      if (!user.giftClaimed) {
        user.randomMatchCards = 20;
        user.giftClaimed = true;
        await user.save({ validateBeforeSave: false });
      }
      return { success: true, message: 'Gift claimed successfully.', randomMatchCards: user.randomMatchCards, giftClaimed: user.giftClaimed };
    }

    user.coins = (user.coins || 0) + Number(amount || 0);
    await user.save({ validateBeforeSave: false });
    if (io) io.to(userId).emit('toast', { type: 'success', message: `💰 ${amount} coins added.` });
    return { success: true, message: 'Coins recharged.', coins: user.coins };
  }

  async getHistory(userId) {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found.' };
    return { success: true, history: user.randomMatchHistory || [] };
  }

  async useFreeCard(userId, io) {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found.' };
    if (user.randomMatchCards > 0) {
      user.randomMatchCards -= 1;
      user.totalRandomCalls = (user.totalRandomCalls || 0) + 1;
      user.totalMinutesUsed = (user.totalMinutesUsed || 0) + 2;
      user.lastRandomMatch = new Date();
      user.randomMatchHistory = user.randomMatchHistory || [];
      user.randomMatchHistory.push({ type: 'free-card', usedAt: new Date(), durationMinutes: 2 });
      await user.save({ validateBeforeSave: false });
      this.stats.cardsUsed += 1;
      this.stats.totalMinutesUsed += 2;
      if (io) io.to(userId).emit('toast', { type: 'success', message: '🎁 Free card used' });
      return { success: true, randomMatchCards: user.randomMatchCards };
    }

    if (user.coins >= 100) {
      user.coins -= 100;
      user.totalCoinsSpent = (user.totalCoinsSpent || 0) + 100;
      user.totalMinutesUsed = (user.totalMinutesUsed || 0) + 1;
      user.lastRandomMatch = new Date();
      user.randomMatchHistory = user.randomMatchHistory || [];
      user.randomMatchHistory.push({ type: 'coin-minute', usedAt: new Date(), durationMinutes: 1 });
      await user.save({ validateBeforeSave: false });
      this.stats.coinsSpent += 100;
      this.stats.totalMinutesUsed += 1;
      if (io) io.to(userId).emit('toast', { type: 'success', message: '💰 100 coins deducted' });
      return { success: true, coins: user.coins, mode: 'coins' };
    }

    return { success: false, message: 'Insufficient coins.' };
  }

  async startCall(userId, partnerId, io) {
    const session = this.userSessions.get(userId);
    if (!session) return { success: false, message: 'No active session.' };
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found.' };

    const sessionHasCard = user.randomMatchCards > 0;
    if (sessionHasCard) {
      const cardState = await this.useFreeCard(userId, io);
      if (!cardState.success) {
        return { success: false, message: cardState.message };
      }
      session.mode = 'free';
      session.remainingCards = cardState.randomMatchCards;
      session.timer = 120;
      session.startedAt = new Date();
      session.expiry = new Date(Date.now() + 120000);
      this.startTimer(session, io);
      return { success: true, session };
    }

    const coinState = await this.useFreeCard(userId, io);
    if (!coinState.success) {
      return { success: false, message: coinState.message };
    }
    session.mode = coinState.mode || 'coins';
    session.remainingCoins = coinState.coins;
    session.timer = 60;
    session.startedAt = new Date();
    session.expiry = new Date(Date.now() + 60000);
    this.startTimer(session, io);
    return { success: true, session };
  }

  startTimer(session, io) {
    if (session.timerInterval) clearInterval(session.timerInterval);
    session.timerInterval = setInterval(async () => {
      if (!session || session.status !== 'active') return;
      session.timer -= 1;
      if (session.timer <= 0) {
        this.endSession(session.userAId, io, 'timeout');
        this.endSession(session.userBId, io, 'timeout');
        return;
      }
      this.emitTimerUpdate(session, io);
    }, 1000);
  }

  emitTimerUpdate(session, io) {
    if (!session) return;
    io.to(session.userAId).emit('timerUpdate', { timer: session.timer, sessionId: session.id });
    io.to(session.userBId).emit('timerUpdate', { timer: session.timer, sessionId: session.id });
  }

  createSession(userDoc, partnerProfile, io) {
    const session = {
      id: `${userDoc._id.toString()}-${partnerProfile._id.toString()}-${Date.now()}`,
      status: 'matched',
      userAId: userDoc._id.toString(),
      userBId: partnerProfile._id.toString(),
      partner: partnerProfile,
      timer: 120,
      mode: 'free',
      startedAt: new Date(),
      createdAt: new Date(),
      acceptedAt: new Date(),
      remainingCards: userDoc.randomMatchCards || 20
    };
    this.sessions.set(session.id, session);
    session.status = 'active';
    randomVideoMonitor.addEvent('session_started', {
      sessionId: session.id,
      userAId: session.userAId,
      userBId: session.userBId,
      mode: session.mode,
    });
    this.startTimer(session, io);
    return session;
  }

  endSession(userId, io, reason = 'ended') {
    const session = this.userSessions.get(userId);
    if (!session) return;
    const otherId = session.userAId === userId ? session.userBId : session.userAId;
    if (session.timerInterval) clearInterval(session.timerInterval);
    session.status = 'ended';
    this.userSessions.delete(session.userAId);
    this.userSessions.delete(session.userBId);
    this.sessions.delete(session.id);
    this.stats.activeCalls = Math.max(0, this.stats.activeCalls - 1);
    randomVideoMonitor.addEvent('session_ended', {
      sessionId: session.id,
      userId,
      otherId,
      reason,
      durationSeconds: session.startedAt ? Math.max(1, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)) : 0,
    });
    if (io) {
      io.to(userId).emit('endMatch', { reason, session });
      io.to(otherId).emit('endMatch', { reason, session });
      if (reason === 'timeout') {
        io.to(userId).emit('toast', { type: 'info', message: '⏰ Free match finished' });
        io.to(otherId).emit('toast', { type: 'info', message: '⏰ Free match finished' });
      }
    }
  }

  isCompatible(userDoc, partnerProfile) {
    if (!partnerProfile || partnerProfile._id.toString() === userDoc._id.toString()) return false;
    const userAge = userDoc.dateOfBirth ? this.getAge(userDoc.dateOfBirth) : 25;
    const partnerAge = partnerProfile.dateOfBirth ? this.getAge(partnerProfile.dateOfBirth) : 25;
    const preferredAgeMin = userDoc.preferredAgeMin || 18;
    const preferredAgeMax = userDoc.preferredAgeMax || 60;
    const matchesAge = partnerAge >= preferredAgeMin && partnerAge <= preferredAgeMax;
    const sameLocation = !userDoc.preferredLocation || !partnerProfile.location || userDoc.preferredLocation.toLowerCase() === partnerProfile.location.toLowerCase();
    const sameLanguage = !userDoc.preferredLanguage || !partnerProfile.preferredLanguage || userDoc.preferredLanguage.toLowerCase() === partnerProfile.preferredLanguage.toLowerCase();
    const partnerGenderMatch = userDoc.preferredGender === 'Any' || partnerProfile.gender === userDoc.preferredGender;
    const verifiedMatch = !userDoc.isVerified || partnerProfile.isVerified;
    const profileComplete = partnerProfile.profileCompleted !== false;
    return partnerGenderMatch && matchesAge && sameLocation && (sameLanguage || !userDoc.preferredLanguage) && verifiedMatch && profileComplete;
  }

  getPublicProfile(userDoc) {
    const profile = {
      _id: userDoc._id,
      name: userDoc.name,
      profilePhoto: userDoc.profilePhoto || '',
      age: userDoc.dateOfBirth ? this.getAge(userDoc.dateOfBirth) : null,
      location: userDoc.location || '',
      gender: userDoc.gender,
      isVerified: userDoc.isVerified || false,
      profileCompleted: userDoc.profileCompleted || false,
      preferredGender: userDoc.preferredGender || 'Any',
      preferredAgeMin: userDoc.preferredAgeMin || 18,
      preferredAgeMax: userDoc.preferredAgeMax || 60,
      preferredLocation: userDoc.preferredLocation || '',
      preferredLanguage: userDoc.preferredLanguage || ''
    };
    return profile;
  }

  getAge(dateOfBirth) {
    const birthday = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birthday.getFullYear();
    const monthDiff = now.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthday.getDate())) age -= 1;
    return age;
  }

  getMonitoringSnapshot() {
    return randomVideoMonitor.buildSnapshot({
      queueSize: this.queue.length,
      activeCalls: this.userSessions.size,
      totalRandomCalls: this.stats.totalRandomCalls,
      reports: this.stats.reports,
      blockedUsers: this.stats.blockedUsers,
      totalMinutesUsed: this.stats.totalMinutesUsed,
      cardsUsed: this.stats.cardsUsed,
      coinsSpent: this.stats.coinsSpent,
    });
  }

  getAnalytics() {
    return {
      success: true,
      analytics: {
        ...this.stats,
        activeCalls: this.userSessions.size,
        queueSize: this.queue.length,
        averageCallDuration: this.stats.totalRandomCalls > 0 ? Math.round(this.stats.totalMinutesUsed / this.stats.totalRandomCalls) : 0,
        monitoring: this.getMonitoringSnapshot(),
      }
    };
  }
}

module.exports = new RandomMatchManager();
