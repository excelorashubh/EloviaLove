import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Heart, X, MapPin, SlidersHorizontal, Zap, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE_URL } from '../data/seoContent';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import CallButton from '../components/videocall/CallButton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';
import InFeedAd from '../components/ads/InFeedAd';
import AdWrapper from '../components/ads/AdWrapper';
import DiscoverFilters from '../components/discover/DiscoverFilters';

// ── Match Popup ──────────────────────────────────────────────────────────────
const MatchPopup = React.memo(({ matchedUser, onClose }) => {
  const navigate = useNavigate();
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <Motion.div
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
      </Motion.div>
    </Motion.div>
  );
});

// ── Profile Card ──────────────────────────────────────────────────────────────
const GridProfileCard = React.memo(({ user, onLike, onPass, onSuperLike }) => {
  const avatar = user?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=e879a0&color=fff&size=800`;

  return (
    <Motion.div
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
    </Motion.div>
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
        <div className="max-w-8xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton to="/dashboard" />
            <h1 className="text-2xl font-extrabold text-slate-900">Discover</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-3 text-sm font-semibold text-pink-700 transition hover:bg-pink-100 dark:border-pink-400/40 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20 lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
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

      <div className="mx-auto max-w-8xl px-4 lg:flex lg:items-start lg:gap-6">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:py-8 xl:w-72">
          <DiscoverFilters
            filters={filters}
            onChange={handleFilterChange}
            onApply={loadFiltered}
            onReset={() => handleFilterChange('reset')}
            userPlan={userPlan}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Hero Section */}
          <section className="mt-6 rounded-2xl bg-linear-to-r from-violet-700 via-fuchsia-600 to-pink-500 px-4 py-10 text-white sm:py-12 lg:mt-8">
            <div className="mx-auto max-w-8xl text-center">
              <h2 className="mb-2 text-3xl font-extrabold sm:text-4xl">Find Amazing People</h2>
              <p className="mx-auto max-w-2xl text-base text-white/90 sm:text-lg">
                Discover meaningful connections with people who share your interests and values.
              </p>
            </div>
          </section>

          {/* Main Content */}
          <main className="py-8">
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
                {/* Responsive grid adjusts to the width remaining beside the desktop filters. */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {users.map((user, idx) => (
                    <React.Fragment key={user._id}>
                      {/* InFeed Ad every 5 profiles */}
                      {idx > 0 && idx % 5 === 0 && (
                        <AdWrapper>
                          <InFeedAd slot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_NATIVE || ''} className="rounded-2xl" />
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
        </div>
      </div>

      <AnimatePresence>
        {showMobileFilters && (
          <>
            <Motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-[60] cursor-default bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <Motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-[70] h-full w-[85vw] max-w-[320px] p-3 lg:hidden"
            >
              <DiscoverFilters
                filters={filters}
                onChange={handleFilterChange}
                onApply={loadFiltered}
                onReset={() => handleFilterChange('reset')}
                userPlan={userPlan}
                onClose={() => setShowMobileFilters(false)}
              />
            </Motion.aside>
          </>
        )}
      </AnimatePresence>

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
