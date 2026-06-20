import React from 'react';
import { CheckCircle2, Lock, MapPin, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PLAN_RANK = { free: 0, basic: 1, premium: 2, pro: 3 };
const planHas = (userPlan, requiredPlan) => PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Gujarati'];

const PillGroup = ({ options, value, onChange, multi = false, disabled = false }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(option => {
      const active = multi ? (value || []).includes(option) : value === option;
      return (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            if (multi) {
              const current = value || [];
              onChange(active ? current.filter(item => item !== option) : [...current, option]);
            } else {
              onChange(active ? '' : option);
            }
          }}
          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-400'}`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

export default function FilterSidebar({ filters, onChange, onApply, onReset, userPlan, activeCount, onUpgradeClick, className = '' }) {
  const field = (key) => ({
    value: filters[key],
    onChange: (value) => onChange(key, value),
  });

  return (
    <aside className={`hidden xl:block w-[360px] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="sticky top-28 space-y-6 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Refine matches</p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900">Filter</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
            {activeCount} active
          </span>
        </div>

        <div className="space-y-5 text-sm text-slate-600">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Location</p>
                <p className="mt-2 text-sm text-slate-700">Focus on your preferred city</p>
              </div>
              <MapPin className="h-5 w-5 text-pink-500" />
            </div>
            <div className="mt-4">
              <input
                value={filters.location || ''}
                onChange={(e) => onChange('location', e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-300"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Distance</p>
                <p className="mt-1 text-sm text-slate-500">Radius from selected location</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{filters.distance || 25} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={filters.distance || 25}
              onChange={(e) => onChange('distance', Number(e.target.value))}
              className="mt-4 w-full accent-pink-500"
            />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Age range</p>
                <p className="mt-1 text-sm text-slate-500">Select your preferred age span</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{filters.ageMin || 18}–{filters.ageMax || 60}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input
                type="number"
                min="18"
                max="80"
                value={filters.ageMin || ''}
                onChange={(e) => onChange('ageMin', e.target.value)}
                placeholder="Min"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <input
                type="number"
                min="18"
                max="80"
                value={filters.ageMax || ''}
                onChange={(e) => onChange('ageMax', e.target.value)}
                placeholder="Max"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Looking for</p>
              <Zap className="h-5 w-5 text-violet-600" />
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <span>Online only</span>
                <input
                  type="checkbox"
                  checked={filters.onlineOnly || false}
                  onChange={(e) => onChange('onlineOnly', e.target.checked)}
                  className="h-4 w-4 accent-pink-500"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <span>Recently active</span>
                <input
                  type="checkbox"
                  checked={filters.recentlyActive || false}
                  onChange={(e) => onChange('recentlyActive', e.target.checked)}
                  className="h-4 w-4 accent-pink-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gender</p>
              <Sparkles className="h-5 w-5 text-pink-500" />
            </div>
            <div className="mt-4">
              <PillGroup options={['Male', 'Female', 'Non-binary']} value={filters.gender} onChange={(value) => onChange('gender', value)} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Relationship goal</p>
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4">
              <PillGroup options={['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship']} value={filters.relationshipGoals} onChange={(value) => onChange('relationshipGoals', value)} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Education</p>
              <div className="mt-4">
                <PillGroup options={["High School", "Bachelor's", "Master's", 'PhD', 'Diploma', 'Other']} value={filters.education} onChange={(value) => onChange('education', value)} />
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Profession</p>
              <div className="mt-4">
                <PillGroup options={['Engineer', 'Doctor', 'Teacher', 'Designer', 'Lawyer', 'Artist', 'Entrepreneur', 'Student', 'Other']} value={filters.profession} onChange={(value) => onChange('profession', value)} />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Lifestyle</p>
              <span className="text-xs text-slate-400">Premium</span>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Smoking</p>
                <PillGroup
                  options={['Never', 'Occasionally', 'Regularly']}
                  value={filters.lifestyle?.smoking}
                  onChange={(value) => onChange('lifestyle', { ...filters.lifestyle, smoking: value })}
                  disabled={!planHas(userPlan, 'premium')}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Drinking</p>
                <PillGroup
                  options={['Never', 'Occasionally', 'Regularly']}
                  value={filters.lifestyle?.drinking}
                  onChange={(value) => onChange('lifestyle', { ...filters.lifestyle, drinking: value })}
                  disabled={!planHas(userPlan, 'premium')}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Verified only</p>
              <span className="text-xs text-slate-400">Pro</span>
            </div>
            <label className="mt-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Only verified profiles</span>
              <input
                type="checkbox"
                checked={filters.isVerified || false}
                onChange={(e) => onChange('isVerified', e.target.checked)}
                disabled={!planHas(userPlan, 'pro')}
                className="h-4 w-4 accent-pink-500"
              />
            </label>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sort by</p>
              <span className="text-xs text-slate-400">Smart UI</span>
            </div>
            <select
              value={filters.sortBy || 'recommended'}
              onChange={(e) => onChange('sortBy', e.target.value)}
              className="mt-4 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="recent">Recently Active</option>
              <option value="compatibility">Best Match</option>
              <option value="age">Age</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3">
          <button
            onClick={onApply}
            className="rounded-[24px] bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
          >
            Apply Filters
          </button>
          <button
            onClick={onReset}
            className="rounded-[24px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>

        <div className="rounded-[28px] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5 text-sm text-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-3xl bg-pink-500 text-white shadow-md">★</div>
            <div>
              <p className="font-semibold text-slate-900">Upgrade for premium access</p>
              <p className="mt-1 text-xs text-slate-600">Unlock advanced filters, unlimited likes, and priority visibility.</p>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="mt-5 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View Plans
          </button>
        </div>
      </motion.div>
    </aside>
  );
}
