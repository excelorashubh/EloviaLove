import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bell, CheckCheck, User } from 'lucide-react';
import api from '../services/api';
import BackButton from '../components/BackButton';

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const formatTime = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const diffM = Math.floor((now - d) / 60000);
  if (diffM < 1) return 'Just now';
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

const getIcon = (type) => {
  switch (type) {
    case 'match': return <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />;
    case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'like': return <Heart className="w-5 h-5 text-red-400" />;
    case 'system': return <Bell className="w-5 h-5 text-slate-500" />;
    default: return <User className="w-5 h-5 text-slate-400" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) setNotifications(res.data.notifications);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BackButton to="/dashboard" />
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <CheckCheck size={15} />
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter tabs */}
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-6">
          <div className="flex">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.filter(n => n.isRead).length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {filtered.map(n => (
              <motion.div
                key={n._id}
                variants={fadeIn}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  n.isRead ? 'border-slate-200' : 'border-primary-200 bg-primary-50/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.isRead ? 'bg-slate-100' : 'bg-primary-100'}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{n.title}</h3>
                      <span className="text-xs text-slate-400 shrink-0">{formatTime(n.createdAt)}</span>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">{n.message}</p>

                    {n.relatedUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={n.relatedUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.relatedUser.name)}&background=e879a0&color=fff`}
                          alt={n.relatedUser.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-slate-700">{n.relatedUser.name}</span>
                      </div>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center py-20">
            <Bell className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No notifications</h2>
            <p className="text-slate-500 text-sm">
              {filter === 'unread' ? "You're all caught up!"
                : filter === 'read' ? "No read notifications yet."
                : "Nothing here yet."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
