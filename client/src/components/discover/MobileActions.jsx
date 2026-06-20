import React from 'react';
import { Filter, Heart, X, Star, Sparkles, Activity } from 'lucide-react';

export default function MobileActions({ onPass, onLike, onSuperLike, onFilters }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-xl sm:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={onFilters}
          className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-pink-500 hover:text-white"
          aria-label="Open filters"
        >
          <Filter size={22} />
        </button>
        <button
          type="button"
          onClick={onPass}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-500 shadow-xl shadow-rose-500/10 transition hover:scale-105"
          aria-label="Pass"
        >
          <X size={26} />
        </button>
        <button
          type="button"
          onClick={onLike}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 text-white shadow-2xl transition hover:scale-105"
          aria-label="Like"
        >
          <Heart size={30} />
        </button>
        <button
          type="button"
          onClick={onSuperLike}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-100 shadow-xl shadow-slate-900/30 transition hover:scale-105"
          aria-label="Super like"
        >
          <Star size={24} />
        </button>
        <button
          type="button"
          className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-violet-500 hover:text-white"
          aria-label="Profile"
        >
          <Sparkles size={22} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400">
        <span className="font-semibold text-white">Swipe-ready matches</span>
        <span className="inline-flex items-center gap-2 text-slate-300"><Activity size={14} /> Fast mode</span>
      </div>
    </div>
  );
}
