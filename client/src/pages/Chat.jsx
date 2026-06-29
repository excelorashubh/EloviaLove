import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_URL } from '../data/seoContent';
import { Send, ArrowLeft, Check, CheckCheck, Phone, MoreVertical, Smile, Paperclip, Image, Gift, Search } from 'lucide-react';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import CallButton from '../components/videocall/CallButton';
import api from '../services/api';

const avatarUrl = (u) =>
  u?.profilePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=e879a0&color=fff`;

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const groupByDate = (messages, myId) => {
  const groups = [];
  let currentDate = null;
  let unreadInserted = false;

  messages.forEach(msg => {
    // Insert "unread" divider before the first unread message from the other person
    const senderId = (msg.sender?._id || msg.sender)?.toString();
    const isFromOther = senderId !== myId;
    if (!unreadInserted && isFromOther && !msg.isRead && !msg.pending) {
      groups.push({ type: 'unread', key: 'unread-divider' });
      unreadInserted = true;
    }

    const date = new Date(msg.createdAt).toDateString();
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ type: 'date', label: formatDate(msg.createdAt), key: date });
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
};

const MessageBubble = React.memo(({ item, isMe, isGrouped, otherAvatar, otherUser, retryFailed }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}
    >
      {/* Other user avatar */}
      {!isMe && !isGrouped && (
        <img src={otherAvatar} alt={`${otherUser?.name}'s profile picture`} loading="lazy" width="28" height="28" className="w-7 h-7 rounded-full object-cover mr-2 self-end shrink-0" />
      )}
      {!isMe && isGrouped && <div className="w-7 mr-2 shrink-0" />}

      <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          onClick={() => item.failed && retryFailed(item)}
          className={[
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed wrap-break-word',
            isMe
              ? `bg-linear-to-br from-primary-600 to-pink-500 text-white shadow-md shadow-pink-500/20
                 ${item.failed ? 'opacity-50 cursor-pointer' : ''}
                 ${item.pending ? 'opacity-80' : ''}`
              : 'bg-white text-slate-900 border border-slate-100 shadow-sm',
            isMe && isGrouped ? 'rounded-tr-md' : '',
            !isMe && isGrouped ? 'rounded-tl-md' : '',
          ].join(' ')}
        >
          {item.content}
          {item.failed && (
            <span className="block text-[10px] text-red-200 mt-1">Tap to retry</span>
          )}
        </div>

        {/* Timestamp + status */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400">{formatTime(item.createdAt)}</span>
          {isMe && (
            item.pending
              ? <Check size={11} className="text-slate-300" />
              : item.failed
                ? <span className="text-[10px] text-red-400">!</span>
                : item.isRead
                  ? <CheckCheck size={11} className="text-primary-500" />
                  : <CheckCheck size={11} className="text-slate-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
});

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  // Normalize current user ID — auth returns 'id', Mongoose virtuals return '_id'
  const myId = (user?.id || user?._id)?.toString();

  const [messages, setMessages]     = useState([]);
  const [otherUser, setOtherUser]   = useState(null);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch]         = useState('');
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [connected, setConnected]   = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMenu, setShowMenu]     = useState(false); // Menu dropdown state

  const socketRef       = useRef(null);
  const messagesEndRef  = useRef(null);
  const unreadRef       = useRef(null);
  const typingTimer     = useRef(null);
  const inputRef        = useRef(null);
  const fileInputRef    = useRef(null);
  const menuRef         = useRef(null); // Ref for menu dropdown

  const handleEmojiClick = () => {
    setInput(prev => `${prev}😊`);
    inputRef.current?.focus();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e?.target) e.target.value = '';
    inputRef.current?.focus();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleBlockUser = async () => {
    if (!window.confirm(`Block ${otherUser?.name}? They won't be able to contact you.`)) return;
    
    try {
      await api.post(`/users/block/${userId}`);
      alert('User blocked successfully');
      setShowMenu(false);
      window.location.href = '/chats';
    } catch (err) {
      alert('Failed to block user');
    }
  };

  const handleReportUser = () => {
    setShowMenu(false);
    alert('Report functionality coming soon');
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    window.location.href = `/profile/${userId}`;
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all messages in this chat? This cannot be undone.')) return;
    
    try {
      await api.delete(`/messages/${userId}`);
      setMessages([]);
      setShowMenu(false);
      alert('Chat cleared successfully');
    } catch (err) {
      alert('Failed to clear chat');
    }
  };
  
  // prevent adding duplicate messages from socket echo
  const sentIds         = useRef(new Set());

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', myId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('private_message', ({ message, from }) => {
      // Only accept messages from the person we're chatting with
      if (from !== userId) return;

      // Deduplicate — ignore if we already have this message (optimistic)
      if (sentIds.current.has(message._id?.toString())) return;

      setMessages(prev => {
        if (prev.some(m => m._id?.toString() === message._id?.toString())) return prev;
        return [...prev, message];
      });

      setConversations(prev => {
        const updatedMsg = {
          id: message._id,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
          isRead: false,
        };
        const idx = prev.findIndex(c => (c.otherUser.id || c.otherUser._id)?.toString() === from?.toString());
        if (idx !== -1) {
          const updated = [...prev];
          const conv = { ...updated[idx] };
          conv.lastMessage = updatedMsg;
          conv.unreadCount = (conv.unreadCount || 0) + 1;
          updated.splice(idx, 1);
          return [conv, ...updated];
        }
        return prev;
      });

      // Mark as read since chat is open
      api.get(`/messages/${userId}`).catch(() => {});
    });

    socket.on('typing', ({ from }) => {
      if (from?.toString() === userId?.toString()) setIsTyping(true);
    });

    socket.on('stop_typing', ({ from }) => {
      if (from?.toString() === userId?.toString()) setIsTyping(false);
    });

    socket.on('messages_read', ({ by }) => {
      if (by?.toString() === userId?.toString()) {
        setMessages(prev =>
          prev.map(m =>
            (m.sender?._id || m.sender)?.toString() === myId
              ? { ...m, isRead: true }
              : m
          )
        );
      }
    });

    return () => {
      clearTimeout(typingTimer.current);
      socket.disconnect();
    };
  }, [userId, myId]);

  // ── Load history + other user ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [msgRes, userRes, convRes] = await Promise.all([
          api.get(`/messages/${userId}?page=1`),
          api.get(`/users/${userId}`),
          api.get('/messages'),
        ]);
        if (msgRes.data.success) {
          setMessages(msgRes.data.messages);
          setHasMore(msgRes.data.pagination.hasMore);
        }
        if (userRes.data.success) setOtherUser(userRes.data.user);
        if (convRes.data.success) {
          setConversations((convRes.data.conversations || []).filter(c => c.lastMessage));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  const hasScrolledToUnread = useRef(false);
  useEffect(() => {
    if (!loading && !hasScrolledToUnread.current && unreadRef.current) {
      unreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToUnread.current = true;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, loading]);

  // ── Load earlier messages ────────────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await api.get(`/messages/${userId}?page=${nextPage}`);
      if (res.data.success) {
        setMessages(prev => [...res.data.messages, ...prev]);
        setHasMore(res.data.pagination.hasMore);
        setPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Typing indicator ─────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { to: userId, from: myId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { to: userId, from: myId });
    }, 1500);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput('');
    socketRef.current?.emit('stop_typing', { to: userId, from: myId });

    // Optimistic bubble
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: { _id: myId, name: user.name, profilePhoto: user.profilePhoto },
      receiver: { _id: userId },
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
      pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await api.post(`/messages/${userId}`, { content });
      if (res.data.success) {
        const saved = res.data.message;
        // Track real ID so socket echo is ignored
        sentIds.current.add(saved._id?.toString() || saved.id?.toString());

        // Replace optimistic with real message
        setMessages(prev =>
          prev.map(m => m._id === tempId ? { ...saved, _id: saved._id || saved.id, pending: false } : m)
        );

        // Server now handles socket delivery to recipient — no need to re-emit here
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m._id === tempId ? { ...m, failed: true, pending: false } : m)
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Retry failed message ─────────────────────────────────────────────────────
  const retryFailed = (msg) => {
    setMessages(prev => prev.filter(m => m._id !== msg._id));
    setInput(msg.content);
    inputRef.current?.focus();
  };

  const filteredConversations = useMemo(() => {
    return (conversations || []).filter(c =>
      (c.otherUser?.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const grouped = groupByDate(messages, myId);
  const otherAvatar = avatarUrl(otherUser);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Chat — Elovia Love</title>
        <meta name="description" content="Real-time messaging with your matches on Elovia Love." />
        <link rel="canonical" href={`${SITE_URL}/chat/${userId}`} />
      </Helmet>
      <div className="h-screen overflow-hidden bg-slate-50">
        <div className="flex h-full">

          {/* Sidebar */}
          <aside className="hidden xl:flex flex-col w-96 border-r border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Messages</p>
                  <p className="text-xs text-slate-500 mt-0.5">All conversations</p>
                </div>
                <Link to="/chats" className="text-slate-500 hover:text-slate-900" aria-label="Open conversations list">
                  <ArrowLeft size={18} />
                </Link>
              </div>
              <div className="mt-4 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">No conversations found.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredConversations.map(conv => {
                    const isActive = (conv.otherUser.id || conv.otherUser._id)?.toString() === userId;
                    const lastMsg = conv.lastMessage || {};
                    const isMeLast = lastMsg?.sender?._id === myId || (lastMsg?.sender || {})?.id === myId;
                    return (
                      <Link
                        key={conv.matchId || conv.otherUser.id}
                        to={`/chat/${conv.otherUser.id || conv.otherUser._id}`}
                        className={`flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors ${isActive ? 'bg-slate-50' : ''}`}
                      >
                        <div className="relative shrink-0">
                          <img src={avatarUrl(conv.otherUser)} alt={conv.otherUser.name} className="w-12 h-12 rounded-2xl object-cover" />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[1.4rem] h-5 px-1.5 rounded-full bg-primary-600 text-white text-[10px] font-semibold flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">{conv.otherUser.name}</p>
                            <span className="text-[11px] text-slate-400">{new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm truncate text-slate-500">
                            {isMeLast ? 'You: ' : ''}{lastMsg.content || 'No messages yet.'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-2 sm:gap-4 shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 z-20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Link to="/chats" className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors xl:hidden shrink-0">
                  <ArrowLeft size={18} className="sm:hidden" />
                  <ArrowLeft size={20} className="hidden sm:block" />
                </Link>
                <div className="relative shrink-0">
                  <img src={otherAvatar} alt={otherUser?.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover" />
                  {connected && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-slate-900 truncate flex items-center gap-1.5 sm:gap-2">
                    {otherUser?.name}
                    {otherUser?.isVerified && <VerifiedBadge size={12} className="sm:hidden" />}
                    {otherUser?.isVerified && <VerifiedBadge size={14} className="hidden sm:inline" />}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    {isTyping ? 'Typing...' : connected ? 'Online' : (otherUser?.location || 'Last seen recently')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Voice Call Button - Smaller on mobile */}
                <button 
                  type="button" 
                  className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" 
                  aria-label="Voice call"
                >
                  <Phone size={16} className="sm:hidden" />
                  <Phone size={18} className="hidden sm:block" />
                </button>
                {/* Video Call Button - Always visible, smaller on mobile */}
                <div className="shrink-0">
                  <CallButton 
                    userId={userId}
                    userInfo={otherUser}
                    variant="icon"
                  />
                </div>
                {/* More Options Menu */}
                <div className="relative" ref={menuRef}>
                  <button 
                    type="button" 
                    onClick={() => setShowMenu(!showMenu)}
                    className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" 
                    aria-label="More options"
                    aria-expanded={showMenu}
                    aria-haspopup="true"
                  >
                    <MoreVertical size={16} className="sm:hidden" />
                    <MoreVertical size={18} className="hidden sm:block" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                    >
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </button>

                      <button
                        onClick={handleClearChat}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Chat
                      </button>

                      <div className="border-t border-slate-100 my-2" />

                      <button
                        onClick={handleReportUser}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Report User
                      </button>

                      <button
                        onClick={handleBlockUser}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Block User
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-hidden bg-slate-50">
              <div className="h-full overflow-y-auto px-4 py-4 sm:px-6">
                {hasMore && (
                  <div className="flex justify-center py-3">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-full border border-slate-200 bg-white shadow-sm transition-colors"
                    >
                      {loadingMore ? 'Loading...' : 'Load earlier messages'}
                    </button>
                  </div>
                )}

                {grouped.map((item, idx) => {
                  if (item.type === 'unread') return (
                    <div key="unread-divider" ref={unreadRef} className="flex items-center gap-3 py-3 my-1">
                      <div className="flex-1 h-px bg-pink-200" />
                      <span className="text-[11px] text-pink-500 font-semibold shrink-0 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">Unread messages</span>
                      <div className="flex-1 h-px bg-pink-200" />
                    </div>
                  );

                  if (item.type === 'date') return (
                    <div key={item.key} className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[11px] text-slate-400 font-medium shrink-0 bg-slate-50 px-2">{item.label}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  );

                  const isMe = (item.sender?._id || item.sender)?.toString() === myId;
                  const prev = grouped[idx - 1];
                  const prevSender = prev?.type === 'message'
                    ? (prev.sender?._id || prev.sender)?.toString()
                    : null;
                  const currSender = (item.sender?._id || item.sender)?.toString();
                  const isGrouped = prevSender === currSender;

                  return (
                    <MessageBubble
                      key={item._id}
                      item={item}
                      isMe={isMe}
                      isGrouped={isGrouped}
                      otherAvatar={otherAvatar}
                      otherUser={otherUser}
                      retryFailed={retryFailed}
                    />
                  );
                })}

                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="flex items-end gap-2 mt-3"
                    >
                      <img src={otherAvatar} alt={`${otherUser?.name} is typing`} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-md flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white border-t border-slate-200 shrink-0">
              <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                <form onSubmit={handleSend} className="flex items-end gap-1.5 sm:gap-2">
                  <button type="button" onClick={handleEmojiClick} className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0 hidden xs:flex items-center justify-center" aria-label="Add emoji">
                    <Smile size={16} className="sm:hidden" />
                    <Smile size={18} className="hidden sm:block" />
                  </button>
                  <button type="button" onClick={handleAttachClick} className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0 hidden xs:flex items-center justify-center" aria-label="Attach file">
                    <Paperclip size={16} className="sm:hidden" />
                    <Paperclip size={18} className="hidden sm:block" />
                  </button>
                  <button type="button" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0 hidden md:flex items-center justify-center" aria-label="Send image">
                    <Image size={16} className="sm:hidden" />
                    <Image size={18} className="hidden sm:block" />
                  </button>
                  <button type="button" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0 hidden md:flex items-center justify-center" aria-label="GIFs">
                    <Gift size={16} className="sm:hidden" />
                    <Gift size={18} className="hidden sm:block" />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 min-h-10 sm:min-h-12 max-h-36 resize-none rounded-3xl border border-slate-200 bg-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    style={{ lineHeight: '1.5' }}
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-primary-600 to-pink-500 text-white hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                    aria-label="Send message"
                  >
                    <Send size={16} className="sm:hidden" />
                    <Send size={18} className="hidden sm:block" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </form>
                <p className="text-center text-[10px] text-slate-400 mt-2 hidden sm:block">Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
