import { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const PLAN_RANK = { free: 0, basic: 1, premium: 2, pro: 3 };
const planHas = (userPlan, required) => PLAN_RANK[userPlan] >= PLAN_RANK[required];

const INTERESTS_OPTIONS = [
  'Travel', 'Coffee', 'Dogs', 'Photography', 'Hiking', 'Music',
  'Cooking', 'Reading', 'Gaming', 'Fitness', 'Art', 'Movies',
  'Dancing', 'Yoga', 'Sports', 'Nature', 'Fashion', 'Tech',
];
const EDUCATION_OPTIONS = ["High School", "Bachelor's", "Master's", 'PhD', 'Diploma', 'Other'];
const PROFESSION_OPTIONS = ['Engineer', 'Doctor', 'Teacher', 'Designer', 'Lawyer', 'Artist', 'Entrepreneur', 'Student', 'Other'];
const GOAL_OPTIONS = ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'];
const INCOME_OPTIONS = ['< 3 LPA', '3–5 LPA', '5–10 LPA', '10–20 LPA', '20+ LPA'];
const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

const DiscoverFilters = ({ filters, onChange, onApply, onReset, userPlan, onClose }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeCount = [
    filters.gender, filters.ageMin, filters.ageMax, filters.location,
    filters.onlineOnly, filters.interests?.length, filters.education,
    filters.profession, filters.relationshipGoals, filters.lifestyle?.smoking,
    filters.lifestyle?.drinking, filters.heightMin, filters.heightMax,
    filters.income, filters.religion, filters.isVerified, filters.recentlyActive,
  ].filter(Boolean).length;

  const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/20 dark:bg-black dark:text-white';
  const inputClass = 'w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/20 dark:bg-black dark:text-white dark:placeholder:text-white/40';
  const checkClass = 'flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-white/20 dark:bg-black dark:text-white/80';

  return (
    <Motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/20 dark:bg-black dark:text-white lg:max-h-[calc(100vh-12rem)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-white/20">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-pink-600 dark:text-pink-400" />
          <h2 className="font-bold">Filters</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700 dark:bg-pink-500/20 dark:text-pink-300">
              {activeCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Location</span>
          <span className="relative block">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              value={filters.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </span>
        </label>

        <div className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Age range</span>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Min age" value={filters.ageMin || ''} onChange={(e) => onChange('ageMin', e.target.value)} className={inputClass} />
            <input type="number" placeholder="Max age" value={filters.ageMax || ''} onChange={(e) => onChange('ageMax', e.target.value)} className={inputClass} />
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Gender</span>
          <select value={filters.gender || ''} onChange={(e) => onChange('gender', e.target.value)} className={selectClass}>
            <option value="">Any gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Sort by</span>
          <select value={filters.sortBy || 'recommended'} onChange={(e) => onChange('sortBy', e.target.value)} className={selectClass}>
            <option value="recommended">Recommended</option>
            <option value="recent">Recently Active</option>
            <option value="compatibility">Best Match</option>
            <option value="age">Age</option>
          </select>
        </label>

        {planHas(userPlan, 'pro') && (
          <label className={checkClass}>
            <input type="checkbox" checked={filters.isVerified || false} onChange={(e) => onChange('isVerified', e.target.checked)} className="h-4 w-4 accent-pink-600" />
            <CheckCircle2 size={16} className="text-blue-500" />
            Verified profiles
          </label>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((shown) => !shown)}
            aria-expanded={showAdvanced}
            className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
          >
            Advanced filters
            {showAdvanced ? <Minus size={16} /> : <Plus size={16} />}
          </button>
          <AnimatePresence initial={false}>
            {showAdvanced && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden pt-3"
              >
                {planHas(userPlan, 'premium') && (
                  <>
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-slate-500 dark:text-white/60">Interests</span>
                      <div className="flex flex-wrap gap-1.5">
                        {INTERESTS_OPTIONS.slice(0, 4).map((interest) => {
                          const selected = (filters.interests || []).includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => {
                                const current = filters.interests || [];
                                onChange('interests', selected ? current.filter((item) => item !== interest) : [...current, interest]);
                              }}
                              className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition ${selected ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20'}`}
                            >
                              {interest}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <select value={filters.education || ''} onChange={(e) => onChange('education', e.target.value)} className={selectClass}>
                      <option value="">Education</option>
                      {EDUCATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <select value={filters.profession || ''} onChange={(e) => onChange('profession', e.target.value)} className={selectClass}>
                      <option value="">Profession</option>
                      {PROFESSION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <select value={filters.relationshipGoals || ''} onChange={(e) => onChange('relationshipGoals', e.target.value)} className={selectClass}>
                      <option value="">Relationship goal</option>
                      {GOAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </>
                )}

                {planHas(userPlan, 'pro') && (
                  <>
                    <select value={filters.income || ''} onChange={(e) => onChange('income', e.target.value)} className={selectClass}>
                      <option value="">Income</option>
                      {INCOME_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <select value={filters.religion || ''} onChange={(e) => onChange('religion', e.target.value)} className={selectClass}>
                      <option value="">Religion</option>
                      {RELIGION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-white/60">Height (cm)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Min" value={filters.heightMin || ''} onChange={(e) => onChange('heightMin', e.target.value)} className={inputClass} />
                        <input type="number" placeholder="Max" value={filters.heightMax || ''} onChange={(e) => onChange('heightMax', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <label className={checkClass}>
                      <input type="checkbox" checked={filters.recentlyActive || false} onChange={(e) => onChange('recentlyActive', e.target.checked)} className="h-4 w-4 accent-pink-600" />
                      Recently active
                    </label>
                    {planHas(userPlan, 'basic') && (
                      <label className={checkClass}>
                        <input type="checkbox" checked={filters.onlineOnly || false} onChange={(e) => onChange('onlineOnly', e.target.checked)} className="h-4 w-4 accent-pink-600" />
                        Online only
                      </label>
                    )}
                  </>
                )}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-slate-200 p-4 dark:border-white/20">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
        >
          <RotateCcw size={15} />
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 px-4 text-sm font-bold text-white transition hover:shadow-md"
        >
          Apply filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>
    </Motion.section>
  );
};

export default DiscoverFilters;
