import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Heart, Search } from 'lucide-react';
import api from '../services/api';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffH = Math.floor((now - d) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

const Matches = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/messages');
        if (res.data.success) setConversations(res.data.conversations);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        <title>Matches — Elovia Love</title>
        <meta name="description" content="View your matches and connect with people you're interested in on Elovia Love." />
        <link rel="canonical" href="https://elovialove.onrender.com/matches" />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-slate-900">Matches</h1>
            <Link to="/discover" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm">
              Find More
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-sm"
          />
        </div>

        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden"
          >
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.matchId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/chat/${conv.otherUser.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.otherUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}&background=e879a0&color=fff`}
                      alt={conv.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                      width="48"
                      height="48"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-900 text-sm">{conv.otherUser.name}</span>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">
                        {formatTime(conv.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
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
          <div className="text-center py-20">
            <Heart className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {search ? 'No matches found' : 'No matches yet'}
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              {search ? 'Try a different name.' : 'Start discovering to find your perfect match!'}
            </p>
            {!search && (
              <Link to="/discover" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm">
                <MessageCircle size={16} /> Start Discovering
              </Link>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Matches;