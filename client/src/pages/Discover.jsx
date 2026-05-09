import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, X, MapPin, SlidersHorizontal, Zap, RotateCcw, BadgeCheck,
  Lock, Crown, Sparkles, ChevronRight, Users, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const EDUCATION_OPTIONS  = ["High School", "Bachelor's", "Master's", "PhD", "Diploma", "Other"];
const PROFESSION_OPTIONS = ['Engineer', 'Doctor', 'Teacher', 'Designer', 'Lawyer', 'Artist', 'Entrepreneur', 'Student', 'Other'];
const GOAL_OPTIONS       = ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'];
const INCOME_OPTIONS     = ['< 3 LPA', '3–5 LPA', '5–10 LPA', '10–20 LPA', '20+ LPA'];
const RELIGION_OPTIONS   = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

// Plan hierarchy
const PLAN_RANK = { free: 0, basic: 1, premium: 2, pro: 3 };
const planHas   = (userPlan, required) => PLAN_RANK[userPlan] >= PLAN_RANK[required];

const PLAN_META = {
  basic:   { label: 'Basic',   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Users },
  premium: { label: 'Premium', color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-200', icon: Sparkles },
  pro:     { label: 'Pro',     color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: Crown },
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
});

// ── Like Toast ───────────────────────────────────────────────────────────────
const LikeToast = React.memo(({ likedUser, onClose }) => {
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
            loading="lazy"
            width="48"
            height="48"
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
});

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
const UpgradeModal = React.memo(({ requiredPlan, onClose }) => {
  const navigate = useNavigate();
  const meta = PLAN_META[requiredPlan] || PLAN_META.premium;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-7 w-full max-w-sm text-center shadow-2xl mb-4 sm:mb-0"
      >
        <div className={`w-14 h-14 ${meta.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Icon size={26} className={meta.color} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-1">{meta.label} Feature</h3>
        <p className="text-slate-500 text-sm mb-5">
          This filter is available on the <span className={`font-bold ${meta.color}`}>{meta.label}</span> plan and above.
          Upgrade to unlock better matches.
        </p>
        <button
          onClick={() => { onClose(); navigate('/pricing'); }}
          className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/30 transition-all mb-2"
        >
          Upgrade Now 🚀
        </button>
        <button onClick={onClose} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600">
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
});

// ── Filter section wrapper ────────────────────────────────────────────────────
const FilterSection = React.memo(({ title, requiredPlan, userPlan, onLockClick, children }) => {
  const locked = !planHas(userPlan, requiredPlan);
  const meta   = PLAN_META[requiredPlan];
  const Icon   = meta?.icon;
  return (
    <div className={`rounded-2xl border p-4 space-y-3 transition-all ${locked ? 'opacity-70' : ''} ${meta ? meta.border : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</p>
        {locked && meta && (
          <button
            onClick={() => onLockClick(requiredPlan)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${meta.bg} ${meta.color} border ${meta.border}`}
          >
            <Lock size={9} /> {meta.label}
          </button>
        )}
      </div>
      <div className={locked ? 'pointer-events-none select-none' : ''}>{children}</div>
    </div>
  );
});

// ── Pill toggle ───────────────────────────────────────────────────────────────
const PillGroup = React.memo(({ options, value, onChange, multi = false }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(opt => {
      const active = multi ? (value || []).includes(opt) : value === opt;
      return (
        <button
          key={opt}
          onClick={() => {
            if (multi) {
              const cur = value || [];
              onChange(active ? cur.filter(x => x !== opt) : [...cur, opt]);
            } else {
              onChange(active ? '' : opt);
            }
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            active ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:border-primary-400'
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
));

// ── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = React.memo(({ filters, onChange, onApply, onClose, userPlan }) => {
  const [upgradeModal, setUpgradeModal] = useState(null); // plan string

  const field = (key) => ({
    value: filters[key],
    onChange: (v) => onChange(key, v),
  });

  const activeCount = [
    filters.gender, filters.ageMin, filters.ageMax, filters.location,
    filters.onlineOnly,
    filters.interests?.length, filters.education, filters.profession, filters.relationshipGoals,
    filters.lifestyle?.smoking, filters.lifestyle?.drinking,
    filters.heightMin, filters.heightMax, filters.income, filters.religion,
    filters.isVerified, filters.recentlyActive,
  ].filter(Boolean).length;

  return (
    <>
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-[340px] bg-white shadow-2xl z-40 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
            {activeCount > 0 && (
              <span className="text-[10px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {/* Plan badge */}
        <div className="px-5 pt-3">
          {(() => {
            const meta = PLAN_META[userPlan];
            const Icon = meta?.icon;
            return meta ? (
              <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${meta.bg} ${meta.color} border ${meta.border}`}>
                <Icon size={13} /> {meta.label} Plan — advanced filters unlocked
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200">
                <Lock size={13} /> Free Plan — upgrade to unlock more filters
              </div>
            );
          })()}
        </div>

        {/* Scrollable filters */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ── FREE ── */}
          <FilterSection title="🆓 Basic Filters" userPlan={userPlan} onLockClick={setUpgradeModal}>
            {/* Gender */}
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Gender</p>
              <PillGroup options={['Male', 'Female', 'Non-binary']} {...field('gender')} />
            </div>
            {/* Age */}
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Age Range: {filters.ageMin || 18} – {filters.ageMax || 60}</p>
              <div className="flex gap-2">
                <input type="number" min={18} max={80} placeholder="Min" value={filters.ageMin}
                  onChange={e => onChange('ageMin', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                <input type="number" min={18} max={80} placeholder="Max" value={filters.ageMax}
                  onChange={e => onChange('ageMax', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            {/* Location */}
            <div>
              <p className="text-xs text-slate-500 mb-1.5">City / Location</p>
              <input type="text" placeholder="e.g. Mumbai" value={filters.location}
                onChange={e => onChange('location', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
          </FilterSection>

          {/* ── BASIC ── */}
          <FilterSection title="💰 Basic Plan" requiredPlan="basic" userPlan={userPlan} onLockClick={setUpgradeModal}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => planHas(userPlan, 'basic') && onChange('onlineOnly', !filters.onlineOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative ${filters.onlineOnly ? 'bg-primary-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.onlineOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700 font-medium">Online users only</span>
              {!planHas(userPlan, 'basic') && <Lock size={12} className="text-slate-400" />}
            </label>
          </FilterSection>

          {/* ── PREMIUM ── */}
          <FilterSection title="🔥 Premium Filters" requiredPlan="premium" userPlan={userPlan} onLockClick={setUpgradeModal}>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Interests</p>
              <PillGroup options={INTERESTS_OPTIONS} value={filters.interests} onChange={v => onChange('interests', v)} multi />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Education</p>
              <PillGroup options={EDUCATION_OPTIONS} {...field('education')} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Profession</p>
              <PillGroup options={PROFESSION_OPTIONS} {...field('profession')} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Relationship Goal</p>
              <PillGroup options={GOAL_OPTIONS} {...field('relationshipGoals')} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Lifestyle</p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Smoking</p>
                  <PillGroup options={['Never', 'Occasionally', 'Regularly']}
                    value={filters.lifestyle?.smoking}
                    onChange={v => onChange('lifestyle', { ...filters.lifestyle, smoking: v })} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Drinking</p>
                  <PillGroup options={['Never', 'Occasionally', 'Regularly']}
                    value={filters.lifestyle?.drinking}
                    onChange={v => onChange('lifestyle', { ...filters.lifestyle, drinking: v })} />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* ── PRO ── */}
          <FilterSection title="👑 Pro Filters" requiredPlan="pro" userPlan={userPlan} onLockClick={setUpgradeModal}>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Height (cm): {filters.heightMin || 140} – {filters.heightMax || 210}</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min cm" value={filters.heightMin}
                  onChange={e => onChange('heightMin', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                <input type="number" placeholder="Max cm" value={filters.heightMax}
                  onChange={e => onChange('heightMax', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Income Range</p>
              <PillGroup options={INCOME_OPTIONS} {...field('income')} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Religion</p>
              <PillGroup options={RELIGION_OPTIONS} {...field('religion')} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => planHas(userPlan, 'pro') && onChange('isVerified', !filters.isVerified)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${filters.isVerified ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.isVerified ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-700 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-blue-500" /> Verified profiles only
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => planHas(userPlan, 'pro') && onChange('recentlyActive', !filters.recentlyActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${filters.recentlyActive ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.recentlyActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-700 font-medium">Recently active (24h)</span>
              </label>
            </div>
          </FilterSection>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-2">
          <button onClick={onApply}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/30 transition-all">
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <button onClick={() => { onChange('reset'); onClose(); }}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">
            Reset all filters
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {upgradeModal && <UpgradeModal requiredPlan={upgradeModal} onClose={() => setUpgradeModal(null)} />}
      </AnimatePresence>
    </>
  );
});

// ── Swipeable Card ────────────────────────────────────────────────────────────
const SwipeCard = React.memo(({ user, onLike, onPass, isTop }) => {
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
        <img src={avatar} alt={user.name} className="w-full h-full object-cover" loading={isTop ? "eager" : "lazy"} width="400" height="400" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="flex items-end gap-2 mb-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            {user.age && <span className="text-xl font-light mb-0.5">{user.age}</span>}
            {user.isVerified && (
              <span className="mb-1" title="Verified"><BadgeCheck size={18} className="text-blue-400" /></span>
            )}
            {user.likedYou && (
              <span className="mb-0.5 px-2 py-0.5 bg-pink-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                <Heart size={8} fill="currentColor" /> Liked you
              </span>
            )}
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
        {/* Extended info pills */}
        {(user.education || user.profession || user.height) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {user.education  && <span className="px-2.5 py-1 bg-blue-50   text-blue-700   rounded-full text-xs font-medium">🎓 {user.education}</span>}
            {user.profession && <span className="px-2.5 py-1 bg-slate-100 text-slate-700  rounded-full text-xs font-medium">💼 {user.profession}</span>}
            {user.height     && <span className="px-2.5 py-1 bg-green-50  text-green-700  rounded-full text-xs font-medium">📏 {user.height}cm</span>}
          </div>
        )}
        {user.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {user.interests.slice(0, 4).map(i => (
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
});

// ── Main Discover Page ────────────────────────────────────────────────────────
const Discover = () => {
  const { user } = useAuth();
  const userPlan = user?.plan || 'free';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [matchPopup, setMatchPopup] = useState(null);
  const [likeToast, setLikeToast] = useState(null);
  const [tab, setTab] = useState('discover');
  const [likedYouData, setLikedYouData] = useState(null);
  const likeToastTimer = useRef(null);
  const [mode, setMode] = useState('random');
  const [filters, setFilters] = useState({
    // free
    gender: '', ageMin: '', ageMax: '', location: '',
    // basic
    onlineOnly: false,
    // premium
    interests: [], education: '', profession: '', relationshipGoals: '', lifestyle: { smoking: '', drinking: '' },
    // pro
    heightMin: '', heightMax: '', income: '', religion: '', isVerified: false, recentlyActive: false,
  });

  const loadRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/match/random');
      setUsers(res.data.users);
      setMode('random');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadLikedYou = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/match/liked-you');
      setLikedYouData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadFiltered = useCallback(async () => {
    setLoading(true);
    setShowFilter(false);
    try {
      const payload = {};
      // Free
      if (filters.gender)   payload.gender   = filters.gender;
      if (filters.ageMin)   payload.ageMin   = Number(filters.ageMin);
      if (filters.ageMax)   payload.ageMax   = Number(filters.ageMax);
      if (filters.location) payload.location = filters.location;
      // Basic
      if (filters.onlineOnly) payload.onlineOnly = true;
      // Premium
      if (filters.interests?.length)  payload.interests       = filters.interests;
      if (filters.education)          payload.education       = filters.education;
      if (filters.profession)         payload.profession      = filters.profession;
      if (filters.relationshipGoals)  payload.relationshipGoals = filters.relationshipGoals;
      if (filters.lifestyle?.smoking || filters.lifestyle?.drinking) payload.lifestyle = filters.lifestyle;
      // Pro
      if (filters.heightMin)    payload.heightMin     = Number(filters.heightMin);
      if (filters.heightMax)    payload.heightMax     = Number(filters.heightMax);
      if (filters.income)       payload.income        = filters.income;
      if (filters.religion)     payload.religion      = filters.religion;
      if (filters.isVerified)   payload.isVerified    = true;
      if (filters.recentlyActive) payload.recentlyActive = true;

      const res = await api.post('/match/filter', payload);
      setUsers(res.data.users);
      setMode('filter');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadRandom(); }, [loadRandom]);

  useEffect(() => {
    if (tab === 'liked-you') loadLikedYou();
  }, [tab, loadLikedYou]);

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
      setFilters({
        gender: '', ageMin: '', ageMax: '', location: '',
        onlineOnly: false,
        interests: [], education: '', profession: '', relationshipGoals: '', lifestyle: { smoking: '', drinking: '' },
        heightMin: '', heightMax: '', income: '', religion: '', isVerified: false, recentlyActive: false,
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 pt-6 pb-10">
      <Helmet>
        <title>Discover Matches — Elovia Love Verified Dating</title>
        <meta name="description" content="Explore verified profiles, discover compatible singles, and find meaningful matches on Elovia Love." />
        <link rel="canonical" href="https://elovialove.onrender.com/discover" />
      </Helmet>
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

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab('discover')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'discover' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Discover
          </button>
          <button
            onClick={() => setTab('liked-you')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === 'liked-you' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Heart size={13} className="text-pink-500" fill="currentColor" />
            Liked You
            {likedYouData?.count > 0 && (
              <span className="bg-pink-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {likedYouData.count}
              </span>
            )}
          </button>
        </div>

        {tab === 'discover' && mode === 'filter' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">Filtered results</span>
            <button onClick={loadRandom} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Card Stack / Liked You */}
      <div className="max-w-md mx-auto px-4">
        {tab === 'liked-you' ? (
          /* ── Liked You Tab ── */
          loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
              <p className="text-slate-500 text-sm">Loading...</p>
            </div>
          ) : !likedYouData?.isPremium ? (
            /* Free user — blurred teaser */
            <div className="text-center py-10">
              <div className="relative w-full max-w-xs mx-auto mb-6">
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-pink-200 to-primary-200 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
                      <Heart size={24} className="text-pink-400 relative z-10" fill="currentColor" />
                    </div>
                  ))}
                </div>
                {likedYouData?.count > 0 && (
                  <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                    {likedYouData.count}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {likedYouData?.count > 0 ? `${likedYouData.count} people liked you` : 'See who likes you'}
              </h3>
              <p className="text-slate-500 text-sm mb-5">Upgrade to Premium to see exactly who liked your profile and match instantly.</p>
              <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/30 transition-all text-sm">
                <Heart size={15} fill="currentColor" /> Upgrade to See
              </a>
            </div>
          ) : likedYouData?.profiles?.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No one has liked you yet. Keep discovering!</p>
            </div>
          ) : (
            /* Premium — show profiles */
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4 text-center">
                {likedYouData.profiles.length} {likedYouData.profiles.length === 1 ? 'person' : 'people'} liked you — like back to match instantly!
              </p>
              {likedYouData.profiles.map((profile, idx) => {
                const avatar = profile.profilePhoto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e879a0&color=fff&size=80`;
                return (
                  <div key={profile._id}>
                    {/* InFeed ad every 5 profiles */}
                    {idx > 0 && idx % 5 === 0 && (
                      <AdWrapper>
                        <InFeedAd slot="4567890123" className="mb-3" />
                      </AdWrapper>
                    )}
                    <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img src={avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover" loading="lazy" width="56" height="56" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-primary-500 rounded-full flex items-center justify-center">
                        <Heart size={10} className="text-white" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{profile.name}{profile.age ? `, ${profile.age}` : ''}</p>
                      {profile.location && <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{profile.location}</p>}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.post('/match/swipe', { targetUserId: profile._id, action: 'like' });
                          if (res.data.isMatch) setMatchPopup(res.data.matchedUser);
                          setLikedYouData(prev => ({ ...prev, profiles: prev.profiles.filter(p => p._id !== profile._id), count: prev.count - 1 }));
                        } catch (e) { console.error(e); }
                      }}
                      className="shrink-0 px-4 py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white text-sm font-bold rounded-xl shadow hover:shadow-pink-500/30 transition-all"
                    >
                      Like Back ❤️
                    </button>
                  </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Discover Tab ── */
          loading ? (
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
                    style={{ zIndex: 3 - i, scale: 1 - i * 0.04, y: i * 10 }}
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
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => swipe('pass')} disabled={swiping}
                  className="w-16 h-16 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-red-400 hover:border-red-300 hover:shadow-red-100 transition-all disabled:opacity-50"
                >
                  <X size={28} strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => swipe('like')} disabled={swiping}
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
          )
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
              userPlan={userPlan}
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
