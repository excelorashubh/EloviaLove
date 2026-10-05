class RandomVideoMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 200;
  }

  addEvent(type, payload = {}) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      type,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
  }

  buildSnapshot({
    queueSize = 0,
    activeCalls = 0,
    totalRandomCalls = 0,
    reports = 0,
    blockedUsers = 0,
    totalMinutesUsed = 0,
    cardsUsed = 0,
    coinsSpent = 0,
    queueEntries = [],
    activeSessionCount = 0,
    activeSessions = [],
  }) {
    const now = Date.now();
    const lastHourEvents = this.events.filter(event => now - new Date(event.timestamp).getTime() <= 60 * 60 * 1000);
    const matchEvents = lastHourEvents.filter(event => event.type === 'match_found').length;
    const reportEvents = lastHourEvents.filter(event => event.type === 'report_submitted').length;
    const failedEvents = lastHourEvents.filter(event => event.type === 'queue_error' || event.type === 'session_error').length;

    const alerts = [];
    if (queueSize >= 20) alerts.push('High queue backlog');
    if (activeCalls >= 8) alerts.push('High active call load');
    if (reportEvents >= 3) alerts.push('Multiple reports in the last hour');
    if (failedEvents >= 3) alerts.push('Repeated random-video errors');

    return {
      status: alerts.length ? 'warning' : 'healthy',
      queueSize,
      queueEntries,
      queueEntriesTruncated: queueSize > queueEntries.length,
      activeSessions: activeCalls,
      activeSessionCount,
      activeSessionEntries: activeSessions,
      activeSessionEntriesTruncated: activeSessionCount > activeSessions.length,
      totalCalls: totalRandomCalls,
      reports,
      blockedUsers,
      cardsUsed,
      coinsSpent,
      minutesUsed: totalMinutesUsed,
      matchRateLastHour: lastHourEvents.length ? Number(((matchEvents / lastHourEvents.length) * 100).toFixed(1)) : 0,
      reportRateLastHour: lastHourEvents.length ? Number(((reportEvents / lastHourEvents.length) * 100).toFixed(1)) : 0,
      failedEventsLastHour: failedEvents,
      alerts,
      recentEvents: this.events.slice(0, 20),
    };
  }
}

module.exports = new RandomVideoMonitor();
