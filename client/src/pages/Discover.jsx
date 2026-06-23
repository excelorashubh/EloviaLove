import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, X, MapPin, SlidersHorizontal, Zap, RotateCcw,
  Lock, Crown, Sparkles, CheckCircle2, ChevronDown, Plus, Minus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';
import InFeedAd from '../components/ads/InFeedAd';
import AdWrapper from '../components/ads/AdWrapper';

const INTERESTS_OPTIONS = [
  'Travel', 'Coffee', 'Dogs', 'Photography', 'Hiking', 'Music',
  'Cooking', 'Reading', 'Gaming', 'Fitness', 'Art', 'Movies',
  'Dancing', 'Yoga', 'Sports', 'Nature', 'Fashion', 'Tech',
];

const EDUCATION_OPTIONS = ["High School", "Bachelor's", "Master's", "PhD", "Diploma", "Other"];
const PROFESSION_OPTIONS = ['Engineer', 'Doctor', 'Teacher', 'Designer', 'Lawyer', 'Artist', 'Entrepreneur', 'Student', 'Other'];
const GOAL_OPTIONS = ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'];
const INCOME_OPTIONS = ['< 3 LPA', '3–5 LPA', '5–10 LPA', '10–20 LPA', '20+ LPA'];
const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

const PLAN_RANK = { free: 0, basic: 1, premium: 2, pro: 3 };
const planHas = (userPlan, required) => PLAN_RANK[userPlan] >= PLAN_RANK[required];

const PLAN_META = {
  basic: { label: 'Basic', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Sparkles },
  premium: { label: 'Premium', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', icon: Sparkles },
  pro: { label: 'Pro', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Crown },
};

// ── Match Popup ──────────────────────────────────────────────────────────────
const MatchPopup = React.memo(({ matchedUser, onClose }) => {
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
        <h2 className="text-3xl font-extrabold bg-linear-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent mb-2">
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
            className="w-full py-3 bg-linear-to-r from-pink-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/40 transition-all"
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
});

// ── Filter Toolbar ──────────────────────────────────────────────────────────────
const FilterToolbar = React.memo(({ filters, onChange, onApply, onReset, userPlan, showMobileFilters, onToggleMobileFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCount = [
    filters.gender, filters.ageMin, filters.ageMax, filters.location,
    filters.onlineOnly, filters.interests?.length, filters.education,
    filters.profession, filters.relationshipGoals, filters.lifestyle?.smoking,
    filters.lifestyle?.drinking, filters.heightMin, filters.heightMax,
    filters.income, filters.religion, filters.isVerified, filters.recentlyActive,
  ].filter(Boolean).length;

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="hidden lg:block sticky top-16 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Location */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <MapPin size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location || ''}
                onChange={(e) => onChange('location', e.target.value)}
                className="bg-transparent text-xs focus:outline-none"
              />
            </div>

            {/* Age Range */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-600">Age:</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.ageMin || ''}
                onChange={(e) => onChange('ageMin', e.target.value)}
                className="bg-transparent text-xs w-12 focus:outline-none"
              />
              <span className="text-xs text-slate-400">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.ageMax || ''}
                onChange={(e) => onChange('ageMax', e.target.value)}
                className="bg-transparent text-xs w-12 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <select
              value={filters.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              className="bg-slate-50 rounded-xl px-3 py-2 text-xs focus:outline-none border-0"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy || 'recommended'}
              onChange={(e) => onChange('sortBy', e.target.value)}
              className="bg-slate-50 rounded-xl px-3 py-2 text-xs focus:outline-none border-0"
            >
              <option value="recommended">Recommended</option>
              <option value="recent">Recently Active</option>
              <option value="compatibility">Best Match</option>
              <option value="age">Age</option>
            </select>

            {/* Verified Filter */}
            {planHas(userPlan, 'pro') && (
              <label className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isVerified || false}
                  onChange={(e) => onChange('isVerified', e.target.checked)}
                  className="w-3 h-3"
                />
                <CheckCircle2 size={14} className="text-blue-500" />
                <span className="text-xs text-slate-600">Verified</span>
              </label>
            )}

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="ml-auto flex items-center gap-1 px-3 py-2 bg-slate-50 rounded-xl text-xs hover:bg-slate-100"
            >
              <SlidersHorizontal size={14} />
              {showAdvanced ? <Minus size={12} /> : <Plus size={12} />}
            </button>

            {/* Reset */}
            {activeCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}

            {/* Apply */}
            <button
              onClick={onApply}
              className="px-4 py-2 bg-linear-to-r from-pink-600 to-pink-500 text-white rounded-xl text-xs font-semibold hover:shadow-md transition-all"
            >
              Apply {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>

          {/* Advanced Filters Row */}
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-100 grid gap-3 grid-cols-4"
            >
              {planHas(userPlan, 'premium') && (
                <>
                  {/* Interests */}
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Interests</label>
                    <div className="flex flex-wrap gap-1">
                      {INTERESTS_OPTIONS.slice(0, 4).map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const cur = filters.interests || [];
                            const updated = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt];
                            onChange('interests', updated);
                          }}
                          className={`px-2 py-1 rounded-full text-[10px] transition ${
                            (filters.interests || []).includes(opt)
                              ? 'bg-pink-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <select
                    value={filters.education || ''}
                    onChange={(e) => onChange('education', e.target.value)}
                    className="bg-slate-50 rounded-xl px-2 py-1 text-xs focus:outline-none border-0"
                  >
                    <option value="">Education</option>
                    {EDUCATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Profession */}
                  <select
                    value={filters.profession || ''}
                    onChange={(e) => onChange('profession', e.target.value)}
                    className="bg-slate-50 rounded-xl px-2 py-1 text-xs focus:outline-none border-0"
                  >
                    <option value="">Profession</option>
                    {PROFESSION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Relationship Goal */}
                  <select
                    value={filters.relationshipGoals || ''}
                    onChange={(e) => onChange('relationshipGoals', e.target.value)}
                    className="bg-slate-50 rounded-xl px-2 py-1 text-xs focus:outline-none border-0"
                  >
                    <option value="">Relationship Goal</option>
                    {GOAL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </>
              )}

              {planHas(userPlan, 'pro') && (
                <>
                  {/* Income */}
                  <select
                    value={filters.income || ''}
                    onChange={(e) => onChange('income', e.target.value)}
                    className="bg-slate-50 rounded-xl px-2 py-1 text-xs focus:outline-none border-0"
                  >
                    <option value="">Income</option>
                    {INCOME_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Religion */}
                  <select
                    value={filters.religion || ''}
                    onChange={(e) => onChange('religion', e.target.value)}
                    className="bg-slate-50 rounded-xl px-2 py-1 text-xs focus:outline-none border-0"
                  >
                    <option value="">Religion</option>
                    {RELIGION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Height Range */}
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-slate-600">Height (cm):</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.heightMin || ''}
                      onChange={(e) => onChange('heightMin', e.target.value)}
                      className="bg-slate-50 rounded-xl px-2 py-1 text-xs w-16 focus:outline-none border-0"
                    />
                    <span className="text-xs text-slate-400">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.heightMax || ''}
                      onChange={(e) => onChange('heightMax', e.target.value)}
                      className="bg-slate-50 rounded-xl px-2 py-1 text-xs w-16 focus:outline-none border-0"
                    />
                  </div>

                  {/* Recently Active */}
                  <label className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.recentlyActive || false}
                      onChange={(e) => onChange('recentlyActive', e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span className="text-xs text-slate-600">Active 24h</span>
                  </label>

                  {/* Online Only */}
                  {planHas(userPlan, 'basic') && (
                    <label className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onlineOnly || false}
                        onChange={(e) => onChange('onlineOnly', e.target.checked)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-slate-600">Online</span>
                    </label>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <button
          onClick={onToggleMobileFilters}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <SlidersHorizontal size={16} />
          Filters {activeCount > 0 && `(${activeCount})`}
          <ChevronDown size={16} className={showMobileFilters ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 space-y-3"
          >
            {/* Basic Filters */}
            <input
              type="text"
              placeholder="Location"
              value={filters.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none border-0"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin || ''}
                onChange={(e) => onChange('ageMin', e.target.value)}
                className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none border-0"
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax || ''}
                onChange={(e) => onChange('ageMax', e.target.value)}
                className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none border-0"
              />
            </div>
            <select
              value={filters.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none border-0"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
            </select>

            <div className="flex gap-2 pt-3">
              <button
                onClick={onReset}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                onClick={onApply}
                className="flex-1 py-2 bg-linear-to-r from-pink-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

// ── Profile Card ──────────────────────────────────────────────────────────────
const GridProfileCard = React.memo(({ user, onLike, onPass, onSuperLike }) => {
  const avatar = user?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=e879a0&color=fff&size=800`;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col rounded-[24px] overflow-hidden bg-white shadow-md hover:shadow-xl transition-transform duration-250 min-h-[470px] lg:min-h-[500px]"
    >
      {/* Top: Large Image */}
      <div className="w-full overflow-hidden bg-slate-100">
        <img
          src={avatar}
          alt={user?.name}
          className="w-full h-[300px] lg:h-[325px] object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{user?.name}{user?.age ? `, ${user.age}` : ''}</h3>
              {user?.isVerified && <VerifiedBadge size={16} className="text-blue-500" />}
            </div>
            {user?.location && (
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {user.location}
              </div>
            )}
            {user?.profession && (
              <div className="text-xs text-slate-500 mt-1">💼 {user.profession}</div>
            )}
          </div>
          {user?.match && (
            <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
              {user.match}%
            </div>
          )}
        </div>

        {user?.bio && (
          <p className="text-sm text-slate-600 mt-3 line-clamp-3 flex-1">{user.bio}</p>
        )}

        {/* Interest Chips */}
        {user?.interests?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {user.interests.slice(0, 5).map(interest => (
              <span
                key={interest}
                className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => onPass && onPass(user._id)}
            className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
            title="Pass"
          >
            <X size={18} className="mx-auto" />
          </button>
          <button
            onClick={() => onLike && onLike(user._id)}
            className="flex-1 py-3 bg-linear-to-r from-pink-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
            title="Like"
          >
            <Heart size={18} className="mx-auto" fill="currentColor" />
          </button>
          <button
            onClick={() => onSuperLike && onSuperLike(user._id)}
            className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
            title="Super Like"
          >
            <Sparkles size={18} className="mx-auto" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

// ── Main Discover Page ────────────────────────────────────────────────────────────────
const Discover = () => {
  const { user } = useAuth();
  const userPlan = user?.plan || 'free';
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [matchPopup, setMatchPopup] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mode, setMode] = useState('random');
  const observerTarget = useRef(null);
  const DISCOVER_PAGE_SIZE = 20;

  const [filters, setFilters] = useState({
    gender: '',
    ageMin: '',
    ageMax: '',
    location: '',
    distance: 25,
    sortBy: 'recommended',
    onlineOnly: false,
    interests: [],
    education: '',
    profession: '',
    relationshipGoals: '',
    lifestyle: { smoking: '', drinking: '' },
    heightMin: '',
    heightMax: '',
    income: '',
    religion: '',
    isVerified: false,
    recentlyActive: false,
  });

  // Load random users
  const loadRandom = useCallback(async (pageNum = 1) => {
    setLoading(true);
    if (pageNum === 1) {
      setPage(1);
      setHasMore(true);
    }

    try {
      const res = await api.get('/users/discover', { params: { page: pageNum } });
      const fetched = Array.isArray(res.data.users) ? res.data.users : [];

      if (import.meta.env.DEV) {
        console.log('Discover fetch result:', {
          page: pageNum,
          fetchedCount: fetched.length,
          users: fetched,
          pagination: res.data.pagination
        });
      }

      if (pageNum === 1) {
        setUsers(fetched);
      } else {
        setUsers(prev => [...prev, ...fetched]);
      }

      setHasMore(res.data.pagination?.hasMore ?? (fetched.length === DISCOVER_PAGE_SIZE));
      setMode('random');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  // Load filtered users
  const loadFiltered = useCallback(async () => {
    setLoading(true);
    setShowMobileFilters(false);
    setPage(1);
    setHasMore(false);

    try {
      const payload = {};
      if (filters.gender) payload.gender = filters.gender;
      if (filters.ageMin) payload.ageMin = Number(filters.ageMin);
      if (filters.ageMax) payload.ageMax = Number(filters.ageMax);
      if (filters.location) payload.location = filters.location;
      if (filters.onlineOnly) payload.onlineOnly = true;
      if (filters.interests?.length) payload.interests = filters.interests;
      if (filters.education) payload.education = filters.education;
      if (filters.profession) payload.profession = filters.profession;
      if (filters.relationshipGoals) payload.relationshipGoals = filters.relationshipGoals;
      if (filters.lifestyle?.smoking || filters.lifestyle?.drinking) payload.lifestyle = filters.lifestyle;
      if (filters.heightMin) payload.heightMin = Number(filters.heightMin);
      if (filters.heightMax) payload.heightMax = Number(filters.heightMax);
      if (filters.income) payload.income = filters.income;
      if (filters.religion) payload.religion = filters.religion;
      if (filters.isVerified) payload.isVerified = true;
      if (filters.recentlyActive) payload.recentlyActive = true;

      const res = await api.post('/match/filter', payload);
      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
      setHasMore(false);
      setMode('filter');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadRandom(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          if (mode === 'random') {
            loadRandom(nextPage);
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '200px' });

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, mode, loadRandom]);

  // Handle swipe action
  const swipe = useCallback(async (action, targetUserId) => {
    try {
      const res = await api.post('/match/swipe', { targetUserId, action });
      if (res.data.isMatch) {
        setMatchPopup(res.data.matchedUser);
      }
      setUsers(prev => prev.filter(u => u._id !== targetUserId));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        gender: '',
        ageMin: '',
        ageMax: '',
        location: '',
        distance: 25,
        sortBy: 'recommended',
        onlineOnly: false,
        interests: [],
        education: '',
        profession: '',
        relationshipGoals: '',
        lifestyle: { smoking: '', drinking: '' },
        heightMin: '',
        heightMax: '',
        income: '',
        religion: '',
        isVerified: false,
        recentlyActive: false,
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Discover — Elovia Love — Find Meaningful Connections</title>
        <meta name="description" content="Discover meaningful connections on Elovia Love. Explore verified singles, advanced filters and premium matches." />
        <link rel="canonical" href={`${SITE_URL}/discover`} />
      </Helmet>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton to="/dashboard" />
            <h1 className="text-2xl font-extrabold text-slate-900">Discover</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadRandom(1)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-pink-600 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Zap size={16} fill="currentColor" />
              Fast Match
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        filters={filters}
        onChange={handleFilterChange}
        onApply={loadFiltered}
        onReset={() => handleFilterChange('reset')}
        userPlan={userPlan}
        showMobileFilters={showMobileFilters}
        onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
      />

      {/* Hero Section */}
      <section className="bg-linear-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white px-4 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Find Amazing People</h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Discover meaningful connections with people who share your interests and values.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4" />
            <p className="text-slate-600">Finding matches...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No more profiles</h3>
            <p className="text-slate-500 mb-6">You've seen everyone! Check back later.</p>
            <button
              onClick={() => loadRandom(1)}
              className="px-6 py-3 bg-pink-600 text-white rounded-2xl font-semibold hover:bg-pink-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Responsive Grid: 4 cols (desktop) → 3 (laptop) → 2 (tablet) → 1 (mobile) */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user, idx) => (
                <React.Fragment key={user._id}>
                  {/* InFeed Ad every 5 profiles */}
                  {idx > 0 && idx % 5 === 0 && (
                    <AdWrapper>
                      <InFeedAd slot="4567890123" className="rounded-2xl" />
                    </AdWrapper>
                  )}
                  <GridProfileCard
                    user={user}
                    onLike={() => swipe('like', user._id)}
                    onPass={() => swipe('pass', user._id)}
                    onSuperLike={() => swipe('super', user._id)}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && <div ref={observerTarget} className="h-10" />}

            {/* Loading indicator at bottom */}
            {loading && users.length > 0 && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
              </div>
            )}
          </>
        )}
      </main>

      {/* Premium Banner */}
      <section className="bg-linear-to-r from-pink-600 to-rose-500 text-white px-4 py-8 sm:py-10 mt-12">
        <div className="max-w-sm sm:max-w-md mx-auto text-center">
          <div className="mb-4 text-3xl">⭐</div>
          <h3 className="text-2xl font-extrabold mb-2">Upgrade to Premium</h3>
          <p className="text-white/90 mb-6">
            Get unlimited likes, advanced filters, priority visibility, and see who liked you.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-white text-pink-600 font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            View Plans
          </button>
        </div>
      </section>

      {/* Match Popup */}
      <AnimatePresence>
        {matchPopup && (
          <MatchPopup matchedUser={matchPopup} onClose={() => setMatchPopup(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
