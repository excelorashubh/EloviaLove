import React from 'react';
import { motion } from 'framer-motion';

export default function FilterSidebar({ className = '', children }) {
  return (
    <aside className={`hidden lg:block w-80 ${className}`}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="sticky top-28 p-5 rounded-3xl bg-white/60 backdrop-blur-md border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Filters</h3>
          <button className="text-xs text-slate-500">Reset</button>
        </div>
        <div className="space-y-4">
          {/* Basic filters placeholders — callers can override via children */}
          {children || (
            <>
              <div>
                <label className="text-xs text-slate-500">Location</label>
                <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="City or ZIP" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Age</label>
                <div className="mt-2 flex gap-2">
                  <input className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="18" />
                  <input className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Verified Only</label>
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" /> <span>Verified</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <button className="w-full rounded-2xl bg-linear-to-r from-primary-600 to-pink-500 text-white px-4 py-2 font-semibold">Apply Filters</button>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">Upgrade for advanced filters</div>
      </motion.div>
    </aside>
  );
}
