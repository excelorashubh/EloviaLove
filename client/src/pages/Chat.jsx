import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Check, CheckCheck, WifiOff } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
            isMe
              ? `bg-gradient-to-br from-primary-600 to-pink-500 text-white shadow-md shadow-pink-500/20
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
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [connected, setConnected]   = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const socketRef       = useRef(null);
  const messagesEndRef  = useRef(null);
  const unreadRef       = useRef(null);
  const typingTimer     = useRef(null);
  const inputRef        = useRef(null);
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
        const [msgRes, userRes] = await Promise.all([
          api.get(`/messages/${userId}?page=1`),
          api.get(`/users/${userId}`),
        ]);
        if (msgRes.data.success) {
          setMessages(msgRes.data.messages);
          setHasMore(msgRes.data.pagination.hasMore);
        }
        if (userRes.data.success) setOtherUser(userRes.data.user);
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const grouped = groupByDate(messages, myId);
  const otherAvatar = otherUser?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=e879a0&color=fff`;

  return (
    <>
      <Helmet>
        <title>Chat — Elovia Love</title>
        <meta name="description" content="Real-time messaging with your matches on Elovia Love." />
        <link rel="canonical" href="https://elovialove.onrender.com/chat" />
      </Helmet>
      <div className="flex flex-col h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 shadow-sm shrink-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3">
            <Link
              to="/chats"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="relative">
              <img src={otherAvatar} alt={otherUser?.name} className="w-10 h-10 rounded-full object-cover" />
              {connected && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm leading-tight truncate">{otherUser?.name}</p>
              <p className="text-xs text-slate-400 leading-tight">
                {isTyping ? (
                  <motion.span
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary-500 font-medium"
                  >
                    typing...
                  </motion.span>
                ) : connected ? (
                  <span className="text-green-500 font-medium">Online</span>
                ) : (
                  otherUser?.location || 'Elovia Love member'
                )}
              </p>
            </div>

            {!connected && (
              <div title="Reconnecting..." className="text-slate-400">
                <WifiOff size={16} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 space-y-1">

          {/* Load more */}
          {hasMore && (
            <div className="text-center mb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-xs text-primary-600 hover:underline font-medium disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load earlier messages'}
              </button>
            </div>
          )}

          {grouped.map((item, idx) => {
            // Unread divider
            if (item.type === 'unread') return (
              <div key="unread-divider" ref={unreadRef} className="flex items-center gap-3 py-3 my-1">
                <div className="flex-1 h-px bg-pink-200" />
                <span className="text-[11px] text-pink-500 font-semibold shrink-0 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                  Unread messages
                </span>
                <div className="flex-1 h-px bg-pink-200" />
              </div>
            );

            // Date separator
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

          {/* Typing indicator */}
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

      {/* ── Input ── */}
      <div className="bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={handleSend} className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-slate-50 focus:bg-white transition-all text-sm resize-none max-h-32 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || sending}
              whileTap={{ scale: 0.92 }}
              className="p-3 bg-gradient-to-br from-primary-600 to-pink-500 text-white rounded-2xl hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send size={18} />
            </motion.button>
          </form>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default Chat;
