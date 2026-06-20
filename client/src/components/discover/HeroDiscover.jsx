import React from 'react';
import { motion } from 'framer-motion';

export default function HeroDiscover({ onUpgradeClick }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#7e5bef] via-[#ec4899] to-[#f97316] px-6 py-10 shadow-2xl sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-8 top-14 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-52 w-52 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
        <div className="space-y-6 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight"
          >
            Discover Amazing People <span aria-hidden>❤️</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-base sm:text-lg text-white/90"
          >
            Find meaningful connections with people who share your interests and values.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid max-w-max gap-4 sm:grid-cols-[auto_auto]"
          >
            <button
              onClick={onUpgradeClick}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-xl shadow-white/20 transition hover:-translate-y-0.5"
            >
              Upgrade Now
            </button>
            <a
              href="#discover-grid"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Browse Matches
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
          <div className="relative space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/25 text-2xl">✨</div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/70">Premium Experience</p>
                <h2 className="text-xl font-bold text-white">Premium Members Get 5× More Matches</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-white/85">
              <p>Upgrade to unlock unlimited likes, advanced filters, priority visibility, and see who liked you.</p>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-white/20 text-white">✓</span>
                  <span>Unlimited likes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-white/20 text-white">✓</span>
                  <span>Advanced profile filters</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-white/20 text-white">✓</span>
                  <span>Priority visibility</span>
                </div>
              </div>
            </div>
            <button
              onClick={onUpgradeClick}
              className="w-full rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-pink-500/30 transition hover:brightness-110"
            >
              Upgrade Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
