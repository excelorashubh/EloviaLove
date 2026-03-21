import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Settings, Bell, Sparkles, MessageCircle, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';
import SubscriptionBanner from '../components/SubscriptionBanner';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffH = Math.floor((now - d) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, notifRes] = await Promise.all([
          api.get('/messages'),
          api.get('/notifications'),
        ]);
        if (convRes.data.success) setConversations(convRes.data.conversations.slice(0, 5));
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications.slice(0, 3));
          setUnreadCount(notifRes.data.unreadCount);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Real-time notifications via socket
  useEffect(() => {
    if (!user?._id) return;
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user._id);
    });
    socketRef.current.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 3));
      setUnreadCount(prev => prev + 1);
    });
    return () => socketRef.current?.disconnect();
  }, [user?._id]);

  // Profile completion checks
  const checks = [
    { label: 'Profile Photo', done: !!user?.profilePhoto },
    { label: 'Bio', done: !!user?.bio },
    { label: 'Location', done: !!user?.location },
    { label: 'Interests', done: user?.interests?.length > 0 },
  ];
  const completionPct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  const avatarSrc = user?.profilePhoto
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=128&background=e879a0&color=fff`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BackButton to="/" />
              <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-primary-600 to-pink-500 text-white p-2 rounded-xl">
                <Heart size={22} fill="currentColor" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-pink-600">
                EloviaLove
              </span>
            </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative p-2 text-slate-500 hover:text-primary-600 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile">
                <img src={avatarSrc} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Trial / subscription banner */}
            <SubscriptionBanner />

            {/* Welcome */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <img src={avatarSrc} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {user?.profileCompleted
                      ? 'Your profile is complete. Start discovering matches!'
                      : 'Complete your profile to start matching with others.'}
                  </p>
                </div>
              </div>
              {!user?.profileCompleted && (
                <Link to="/profile/edit"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Settings size={14} /> Complete Profile
                </Link>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}
              className="grid grid-cols-2 gap-4"
            >
              <Link to="/discover"
                className="bg-gradient-to-r from-primary-600 to-pink-500 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Discover</h3>
                    <p className="text-primary-100 text-sm">Find your match</p>
                  </div>
                  <Sparkles className="w-7 h-7 text-white/70 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
              <Link to="/matches"
                className="bg-white text-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Matches</h3>
                    <p className="text-slate-500 text-sm">
                      {conversations.length > 0 ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''}` : 'Chat with matches'}
                    </p>
                  </div>
                  <Heart className="w-7 h-7 text-pink-500 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
              <Link to="/chats"
                className="col-span-2 bg-white text-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Chats</h3>
                    <p className="text-slate-500 text-sm">
                      {conversations.filter(c => c.lastMessage).length > 0
                        ? `${conversations.filter(c => c.lastMessage).length} active conversation${conversations.filter(c => c.lastMessage).length > 1 ? 's' : ''}`
                        : 'All your conversations'}
                    </p>
                  </div>
                  <MessageCircle className="w-7 h-7 text-primary-500 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Recent Conversations */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Recent Chats</h2>
                <Link to="/chats" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-1 -mx-2">
                  {conversations.map(conv => (
                    <motion.div key={conv.matchId} variants={fadeIn}>
                      <Link
                        to={`/chat/${conv.otherUser.id}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={conv.otherUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}&background=e879a0&color=fff`}
                          alt={conv.otherUser.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 text-sm">{conv.otherUser.name}</span>
                            <span className="text-xs text-slate-400">{formatTime(conv.lastMessage?.createdAt)}</span>
                          </div>
                          <p className={`text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                            {conv.lastMessage
                              ? (conv.lastMessage.sender._id !== conv.otherUser.id ? 'You: ' : '') + conv.lastMessage.content
                              : 'Say hello!'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-10">
                  <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-4">No matches yet. Start discovering!</p>
                  <Link to="/discover"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <MessageCircle size={14} /> Find Matches
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Profile Completion */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-base font-bold text-slate-900 mb-4">Profile Completion</h3>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-semibold text-primary-600">{completionPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {checks.map(({ label, done }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    {done
                      ? <Check size={15} className="text-green-500" />
                      : <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block" />
                    }
                  </div>
                ))}
              </div>

              <Link to="/profile/edit"
                className="inline-flex items-center gap-2 mt-5 w-full justify-center px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                <Settings size={14} /> Edit Profile
              </Link>
              <Link to="/pricing"
                className="inline-flex items-center gap-2 mt-2 w-full justify-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl hover:shadow-md transition-all text-sm font-bold"
              >
                ✨ {user?.plan === 'free' ? 'Upgrade Plan' : `${user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} Plan`}
              </Link>
            </motion.div>

            {/* Notifications */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <Link to="/notifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
              </div>

              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map(i => <div key={i} className="h-4 bg-slate-200 rounded w-full" />)}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n._id} className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-slate-300' : 'bg-primary-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatTime(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No new notifications</p>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
