import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Clock, X } from 'lucide-react';

const confettiShapes = [
  { left: 10, top: 12, size: 6, color: 'bg-pink-400' },
  { left: 80, top: 18, size: 5, color: 'bg-amber-300' },
  { left: 24, top: 72, size: 7, color: 'bg-sky-400' },
  { left: 68, top: 82, size: 5, color: 'bg-violet-400' },
  { left: 44, top: 36, size: 8, color: 'bg-white' },
  { left: 12, top: 84, size: 5, color: 'bg-rose-400' },
  { left: 90, top: 55, size: 6, color: 'bg-cyan-300' },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
};

const PremiumTrialModal = ({ open, onClose, trialEndDate, userName }) => {
  if (!open) return null;

  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialEndDate) - new Date()) / 86400000))
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 max-w-2xl w-full rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/50 overflow-hidden"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-300 hover:text-white transition-colors"
            aria-label="Close premium welcome modal"
          >
            <X size={22} />
          </button>

          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-pink-500/20 to-transparent pointer-events-none" />

          <div className="relative rounded-[2rem] bg-slate-900/90 border border-slate-800 p-8 shadow-lg">
            <div className="absolute inset-0 pointer-events-none">
              {confettiShapes.map((shape, index) => (
                <motion.span
                  key={index}
                  className={`absolute rounded-full ${shape.color} opacity-80`}
                  style={{ left: `${shape.left}%`, top: `${shape.top}%`, width: shape.size, height: shape.size }}
                  animate={{ y: [0, -18, 0], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.15 }}
                />
              ))}
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-[0_20px_80px_-30px_rgba(236,72,153,0.75)]">
                <Sparkles className="text-white" size={38} />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-400 font-semibold mb-3">
                Exclusive welcome gift
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                10 Days of Premium Access
              </h2>
              <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {userName ? `${userName},` : 'Great news,'} your Premium trial is live. Enjoy advanced filters, read receipts, priority match access and no ads for the next 10 days.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300 mb-3">
                    <Heart size={18} />
                  </div>
                  <p className="text-sm font-semibold text-white">Meet more serious matches</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300 mb-3">
                    <Clock size={18} />
                  </div>
                  <p className="text-sm font-semibold text-white">Trial ends on {formatDate(trialEndDate)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300 mb-3">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-sm font-semibold text-white">{daysLeft !== null ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Premium active'}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100 transition"
                >
                  Continue to Dashboard
                </button>
                <Link
                  to="/pricing"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:brightness-110 transition"
                >
                  Keep Premium After Trial
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumTrialModal;
