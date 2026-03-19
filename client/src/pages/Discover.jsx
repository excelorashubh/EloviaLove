import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, MapPin, SlidersHorizontal, Zap, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

const INTERESTS_OPTIONS = [
  'Travel', 'Coffee', 'Dogs', 'Photography', 'Hiking', 'Music',
  'Cooking', 'Reading', 'Gaming', 'Fitness', 'Art', 'Movies',
  'Dancing', 'Yoga', 'Sports', 'Nature', 'Fashion', 'Tech'
];

// ── Match Popup ──────────────────────────────────────────────────────────────
const MatchPopup = ({ matchedUser, onClose }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent mb-2">
          It's a Match!
        </h2>
        <p className="text-slate-500 mb-6">You and {matchedUser?.name} liked each other</p>
        <img
          src={matchedUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser?.name || '')}&background=e879a0&color=fff&size=80`}
          alt={matchedUser?.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-pink-300 shadow-lg"
        />
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/chat/${matchedUser?.id}`)}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/40 transition-all"
          >
            Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-2xl hover:bg-slate-50 transition-all"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Like Toast ───────────────────────────────────────────────────────────────
const LikeToast = ({ likedUser, onClose }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={likedUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(likedUser?.name || '')}&background=e879a0&color=fff&size=80`}
            alt={likedUser?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart size={10} className="text-white" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">You liked {likedUser?.name}</p>
          <p className="text-xs text-slate-400">If they like you back, it's a match!</p>
        </div>
        <button
          onClick={() => { onClose(); navigate('/matches'); }}
          className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all"
        >
          View
        </button>
        <button onClick={onClose} className="shrink-0 p-1 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

// ── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onChange, onApply, onClose }) => (
  <motion.div
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col"
  >
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
      <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
      {/* Gender */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Gender</label>
        <div className="flex gap-2">
          {['', 'Male', 'Female', 'Non-binary'].map(g => (
            <button
              key={g}
              onClick={() => onChange('gender', g)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filters.gender === g ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:border-primary-400'
              }`}
            >
              {g || 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Age Range: {filters.ageMin || 18} – {filters.ageMax || 60}
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">Min</p>
            <input
              type="number" min={18} max={80}
              value={filters.ageMin}
              onChange={e => onChange('ageMin', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">Max</p>
            <input
              type="number" min={18} max={80}
              value={filters.ageMax}
              onChange={e => onChange('ageMax', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Location</label>
        <input
          type="text"
          placeholder="e.g. New York"
          value={filters.location}
          onChange={e => onChange('location', e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Interests */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS_OPTIONS.map(i => (
            <button
              key={i}
              onClick={() => {
                const cur = filters.interests || [];
                onChange('interests', cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                (filters.interests || []).includes(i)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-200 text-slate-600 hover:border-primary-400'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="px-5 py-4 border-t border-slate-100 space-y-2">
      <button
        onClick={onApply}
        className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg"
      >
        Apply Filters
      </button>
      <button
        onClick={() => { onChange('reset'); onClose(); }}
        className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
      >
        Reset
      </button>
    </div>
  </motion.div>
);

// ── Swipeable Card ────────────────────────────────────────────────────────────
const SwipeCard = ({ user, onLike, onPass, isTop }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onLike();
    else if (info.offset.x < -100) onPass();
  };

  const avatar = user.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e879a0&color=fff&size=400`;

  return (
    <motion.div
      style={{ x, rotate, position: 'absolute', width: '100%' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden select-none"
    >
      {/* Like / Pass overlays */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-6 z-10 rotate-[-20deg] border-4 border-green-400 text-green-400 font-extrabold text-2xl px-3 py-1 rounded-xl">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-6 z-10 rotate-[20deg] border-4 border-red-400 text-red-400 font-extrabold text-2xl px-3 py-1 rounded-xl">
        NOPE
      </motion.div>

      {/* Photo */}
      <div className="relative h-96">
        <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="flex items-end gap-2 mb-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            {user.age && <span className="text-xl font-light mb-0.5">{user.age}</span>}
          </div>
          {user.location && (
            <div className="flex items-center gap-1 text-sm text-white/80">
              <MapPin size={13} /> {user.location}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        {user.bio && <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-2">{user.bio}</p>}
        {user.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {user.interests.slice(0, 5).map(i => (
              <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{i}</span>
            ))}
          </div>
        )}
        {user.relationshipGoals && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Heart size={11} className="text-pink-400" /> {user.relationshipGoals}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Discover Page ────────────────────────────────────────────────────────
const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [matchPopup, setMatchPopup] = useState(null);
  const [likeToast, setLikeToast] = useState(null);
  const likeToastTimer = useRef(null);
  const [mode, setMode] = useState('random'); // 'random' | 'filter'
  const [filters, setFilters] = useState({ gender: '', ageMin: '', ageMax: '', location: '', interests: [] });

  const loadRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/match/random');
      setUsers(res.data.users);
      setMode('random');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadFiltered = useCallback(async () => {
    setLoading(true);
    setShowFilter(false);
    try {
      const payload = {};
      if (filters.gender) payload.gender = filters.gender;
      if (filters.ageMin) payload.ageMin = Number(filters.ageMin);
      if (filters.ageMax) payload.ageMax = Number(filters.ageMax);
      if (filters.location) payload.location = filters.location;
      if (filters.interests?.length) payload.interests = filters.interests;
      const res = await api.post('/match/filter', payload);
      setUsers(res.data.users);
      setMode('filter');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadRandom(); }, [loadRandom]);

  // Preload more when 2 cards left
  useEffect(() => {
    if (!loading && users.length <= 2 && users.length > 0 && mode === 'random') {
      loadRandom();
    }
  }, [users.length]); // eslint-disable-line

  const swipe = async (action) => {
    if (swiping || users.length === 0) return;
    const target = users[0];
    setSwiping(true);
    try {
      const res = await api.post('/match/swipe', { targetUserId: target._id, action });
      if (res.data.isMatch) {
        setMatchPopup(res.data.matchedUser);
      } else if (action === 'like') {
        // Show like toast for non-match likes
        clearTimeout(likeToastTimer.current);
        setLikeToast(target);
        likeToastTimer.current = setTimeout(() => setLikeToast(null), 3000);
      }
    } catch (e) { console.error(e); }
    setUsers(prev => prev.slice(1));
    setSwiping(false);
  };

  const forceMatch = async () => {
    if (users.length === 0) return;
    const target = users[0];
    try {
      await api.post('/match/force', { targetUserId: target._id });
      setMatchPopup({ id: target._id, name: target.name, profilePhoto: target.profilePhoto });
      setUsers(prev => prev.slice(1));
    } catch (e) { console.error(e); }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ gender: '', ageMin: '', ageMax: '', location: '', interests: [] });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 pt-6 pb-10">
      {/* Header */}
      <div className="max-w-md mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton to="/dashboard" />
            <h1 className="text-2xl font-extrabold text-slate-900">Discover</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadRandom}
              title="Fast Match"
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-pink-500/30 transition-all"
            >
              <Zap size={15} fill="currentColor" /> Fast Match
            </button>
            <button
              onClick={() => setShowFilter(true)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-primary-400 transition-colors shadow-sm"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
        {mode === 'filter' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">Filtered results</span>
            <button onClick={loadRandom} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Card Stack */}
      <div className="max-w-md mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
            <p className="text-slate-500 text-sm">Finding matches...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Heart className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No more profiles</h2>
            <p className="text-slate-400 text-sm mb-6">You've seen everyone! Check back later.</p>
            <button onClick={loadRandom} className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors">
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Stack: show top 3 cards */}
            <div className="relative h-[520px]">
              {users.slice(0, 3).map((u, i) => (
                <motion.div
                  key={u._id}
                  style={{
                    zIndex: 3 - i,
                    scale: 1 - i * 0.04,
                    y: i * 10,
                  }}
                  className="absolute w-full"
                >
                  <SwipeCard
                    user={u}
                    isTop={i === 0}
                    onLike={() => swipe('like')}
                    onPass={() => swipe('pass')}
                  />
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-6 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => swipe('pass')}
                disabled={swiping}
                className="w-16 h-16 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-red-400 hover:border-red-300 hover:shadow-red-100 transition-all disabled:opacity-50"
              >
                <X size={28} strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => swipe('like')}
                disabled={swiping}
                className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full shadow-lg shadow-pink-500/30 flex items-center justify-center text-white hover:shadow-pink-500/50 transition-all disabled:opacity-50"
              >
                <Heart size={28} fill="currentColor" />
              </motion.button>
            </div>

            {/* Dev: Force Match */}
            {import.meta.env.DEV && users.length > 0 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={forceMatch}
                  className="text-xs text-slate-400 border border-dashed border-slate-300 px-3 py-1.5 rounded-xl hover:text-primary-500 hover:border-primary-300 transition-colors"
                >
                  ⚡ Force Match (dev)
                </button>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-5">
              {users.slice(0, Math.min(users.length, 8)).map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${i === 0 ? 'w-5 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-slate-200'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30"
              onClick={() => setShowFilter(false)}
            />
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onApply={loadFiltered}
              onClose={() => setShowFilter(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Match Popup */}
      <AnimatePresence>
        {matchPopup && <MatchPopup matchedUser={matchPopup} onClose={() => setMatchPopup(null)} />}
      </AnimatePresence>

      {/* Like Toast */}
      <AnimatePresence>
        {likeToast && <LikeToast likedUser={likeToast} onClose={() => { clearTimeout(likeToastTimer.current); setLikeToast(null); }} />}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
