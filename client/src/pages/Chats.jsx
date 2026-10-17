import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MessageCircle, Check, CheckCheck, Sparkles, X } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import api from '../services/api';
import BackButton from '../components/BackButton';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffM = Math.floor((now - d) / 60000);
  if (diffM < 1) return 'Just now';
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const avatarUrl = (u) =>
  u?.profilePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=e879a0&color=fff`;

const Chats = () => {
  const { user, socket } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // track which matchIds just got a new message (for flash animation)
  const [newlyReceived, setNewlyReceived] = useState(new Set());
  const seenMessageIds = useRef(new Set());
  const flashTimers = useRef(new Map());
  const requestId = useRef(0);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const loadConversations = useCallback(async () => {
    const currentRequest = ++requestId.current;
    try {
      const res = await api.get('/messages');
      if (currentRequest === requestId.current && res.data.success) {
        setConversations((res.data.conversations || []).filter(c => c.lastMessage));
      }
    } catch (e) {
      console.error('Chats fetch error:', e.response?.data || e.message);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!socket || !user?._id) return undefined;
    const myId = String(user.id || user._id);
    const handlePrivateMessage = ({ message, from, to }) => {
      const messageId = String(message?._id || message?.id || '');
      if (!messageId || seenMessageIds.current.has(messageId)) return;
      seenMessageIds.current.add(messageId);

      const senderId = String(message.sender?._id || message.sender?.id || message.sender || from || '');
      const receiverId = String(message.receiver?._id || message.receiver?.id || message.receiver || to || '');
      const sentByMe = senderId === myId;
      const otherUserId = sentByMe ? receiverId : senderId;
      if (!otherUserId) {
        loadConversations();
        return;
      }

      const updatedMsg = {
        id: messageId,
        _id: messageId,
        content: message.content,
        sender: message.sender,
        createdAt: message.createdAt,
        isRead: Boolean(message.isRead),
      };
      const conversationFound = conversationsRef.current.some(
        c => String(c.otherUser.id || c.otherUser._id) === otherUserId
      );
      if (!conversationFound) {
        const otherProfile = sentByMe ? message.receiver : message.sender;
        if (!otherProfile?.name) {
          loadConversations();
          return;
        }
        const newConversation = {
          matchId: `temp-${otherUserId}`,
          otherUser: {
            id: otherUserId,
            name: otherProfile.name,
            profilePhoto: otherProfile.profilePhoto,
          },
          lastMessage: updatedMsg,
          unreadCount: sentByMe ? 0 : 1,
        };
        setConversations(prev => [newConversation, ...prev]);
        if (!sentByMe) {
          setNewlyReceived(prev => new Set(prev).add(newConversation.matchId));
        }
        loadConversations();
        return;
      }

      setConversations(prev => {
        const idx = prev.findIndex(
          c => String(c.otherUser.id || c.otherUser._id) === otherUserId
        );
        if (idx === -1) return prev;

        const updated = [...prev];
        const conv = {
          ...updated[idx],
          lastMessage: updatedMsg,
          unreadCount: sentByMe ? updated[idx].unreadCount : (updated[idx].unreadCount || 0) + 1,
        };
        updated.splice(idx, 1);
        return [conv, ...updated];
      });

      if (sentByMe) return;

      const conversation = conversationsRef.current.find(c => String(c.otherUser.id || c.otherUser._id) === otherUserId);
      const flashId = String(conversation?.matchId || `temp-${otherUserId}`);
      setNewlyReceived(prev => new Set(prev).add(flashId));
      window.clearTimeout(flashTimers.current.get(flashId));
      flashTimers.current.set(flashId, window.setTimeout(() => {
        setNewlyReceived(prev => {
          const next = new Set(prev);
          next.delete(flashId);
          return next;
        });
        flashTimers.current.delete(flashId);
      }, 2500));
    };

    const handleMessagesRead = ({ by }) => {
      setConversations(prev => prev.map(conv => (
        String(conv.otherUser.id || conv.otherUser._id) === String(by)
          && String(conv.lastMessage?.sender?._id || conv.lastMessage?.sender?.id || conv.lastMessage?.sender) === myId
          ? { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv
      )));
    };

    socket.on('private_message', handlePrivateMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('messages_deleted', loadConversations);
    socket.on('connect', loadConversations);
    if (socket.connected) loadConversations();

    const handleProfileUpdate = () => loadConversations();
    window.addEventListener('profile_updated', handleProfileUpdate);
    const timersToClear = flashTimers.current;
    return () => {
      socket.off('private_message', handlePrivateMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('messages_deleted', loadConversations);
      socket.off('connect', loadConversations);
      window.removeEventListener('profile_updated', handleProfileUpdate);
      timersToClear.forEach(window.clearTimeout);
      timersToClear.clear();
    };
  }, [loadConversations, socket, user?._id, user?.id]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const filtered = useMemo(() => {
    return conversations.filter(c =>
      c.otherUser.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Messages — Elovia Love</title>
        <meta name="description" content="View and manage all your conversations on Elovia Love." />
        <link rel="canonical" href={`${SITE_URL}/chats`} />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-20 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <BackButton to="/dashboard" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Chats</h1>
                <AnimatePresence mode="wait">
                  {totalUnread > 0 && (
                    <Motion.p
                      key="unread"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-primary-600 font-semibold"
                    >
                      {totalUnread} unread
                    </Motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <Link
              to="/matches"
              className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <Sparkles size={14} /> Matches
            </Link>
          </div>

          {/* Search */}
          <div className="relative pb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
            />
            <AnimatePresence>
              {search && (
                <Motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </Motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            {search ? (
              <>
                <Search className="w-12 h-12 text-slate-200 mb-4" />
                <p className="font-semibold text-slate-700">No results for "{search}"</p>
                <p className="text-slate-400 text-sm mt-1">Try a different name.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-linear-to-br from-primary-100 to-pink-100 rounded-full flex items-center justify-center mb-5">
                  <MessageCircle className="w-9 h-9 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No chats yet</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">
                  Once you match with someone and start a conversation, it'll show up here.
                </p>
                <Link
                  to="/matches"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary-600 to-pink-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
                >
                  <Sparkles size={15} /> View Matches
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filtered.map((conv) => {
                const isUnread = conv.unreadCount > 0;
                const isNew = newlyReceived.has(conv.matchId?.toString());
                const isMe = String(
                  conv.lastMessage?.sender?._id
                  || conv.lastMessage?.sender?.id
                  || conv.lastMessage?.sender
                  || ''
                ) === String(user.id || user._id);

                return (
                  <Motion.div
                    key={conv.matchId}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundColor: isNew ? '#fdf2f8' : '#ffffff',
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Link
                      to={`/chat/${conv.otherUser.id}`}
                      className={`flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-pink-50 active:bg-pink-100 transition-colors relative ${
                        isUnread ? 'border-l-4 border-primary-500' : 'border-l-4 border-transparent'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl(conv.otherUser)}
                          alt={conv.otherUser.name}
                          className={`w-14 h-14 rounded-full object-cover transition-all ${
                            isUnread ? 'ring-2 ring-primary-400 ring-offset-2' : ''
                          }`}
                          loading="lazy"
                          width="56"
                          height="56"
                        />
                        {isUnread && (
                          <Motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                          >
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </Motion.span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'} flex items-center gap-1`}>
                            {conv.otherUser.name}
                            {conv.otherUser.isVerified && <VerifiedBadge size={14} />}
                          </span>
                          <span className={`text-[11px] shrink-0 ml-2 ${isUnread ? 'text-primary-500 font-semibold' : 'text-slate-400'}`}>
                            {formatTime(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isMe && !isUnread && (
                            conv.lastMessage?.isRead
                              ? <CheckCheck size={13} className="text-primary-500 shrink-0" />
                              : <Check size={13} className="text-slate-400 shrink-0" />
                          )}
                          <p className={`text-sm truncate ${isUnread ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                            {isMe ? 'You: ' : ''}{conv.lastMessage?.content}
                          </p>
                        </div>
                      </div>

                      {/* Unread dot pulse for brand-new messages */}
                      {isNew && (
                        <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                      )}
                    </Link>
                  </Motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Chats;
