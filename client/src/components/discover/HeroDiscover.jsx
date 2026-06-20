import React from 'react';
import { motion } from 'framer-motion';

export default function HeroDiscover({ onUpgradeClick }) {
  return (
    <section className="w-full rounded-3xl p-6 bg-linear-to-r from-primary-50 to-pink-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-8">
        <div className="flex-1">
          <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
            Discover Amazing People <span aria-hidden>❤️</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mt-4 text-lg text-slate-600 max-w-2xl">
            Find meaningful connections with people who share your interests and values.
          </motion.p>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={onUpgradeClick} className="rounded-2xl bg-linear-to-r from-primary-600 to-pink-500 text-white px-5 py-3 font-semibold shadow-lg hover:shadow-pink-500/30 transition">
              Upgrade Now
            </button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Browse Free</button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-80 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-100 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">Premium Members Get 5× More Matches</div>
              <p className="text-sm text-slate-500 mt-2">Upgrade to unlock unlimited likes, advanced filters, and priority visibility.</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={onUpgradeClick} className="w-full rounded-2xl bg-linear-to-r from-primary-600 to-pink-500 px-4 py-2 text-white font-semibold">Upgrade Now</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
