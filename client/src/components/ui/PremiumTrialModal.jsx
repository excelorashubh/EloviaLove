import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  Sparkles,
  Heart,
  Gift,
  Crown,
  MessageCircle,
  Search,
  Eye,
  Rocket,
  Video,
  BadgeCheck,
  CheckCircle2,
  Headphones,
  X,
  Sparkle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const PRIMARY = '#FF4F8B';
const SECONDARY = '#FF6FA8';
const LIGHT_PINK = '#FFF3F8';
const ROSE = '#FFE5EF';
const SOFT_WHITE = '#FFFFFF';
const GOLD = '#F8C84E';
const TEXT = '#4B1D31';
const TEXT_SECONDARY = '#7B5B69';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
};

const features = [
  { label: 'Unlimited Likes', icon: Heart, color: 'from-[#ffdee7] to-[#ffd2df]' },
  { label: 'Unlimited Messages', icon: MessageCircle, color: 'from-[#ffe9f1] to-[#ffdae8]' },
  { label: 'AI Smart Matchmaking', icon: Sparkles, color: 'from-[#ffd7e3] to-[#ffe4ed]' },
  { label: 'See Who Likes You', icon: Eye, color: 'from-[#ffdfeb] to-[#ffe6f0]' },
  { label: 'Advanced Search Filters', icon: Search, color: 'from-[#ffe0ec] to-[#ffd7e6]' },
  { label: 'Profile Boost', icon: Rocket, color: 'from-[#fff0f5] to-[#ffe2ed]' },
  { label: 'HD Video Calls', icon: Video, color: 'from-[#ffe5f1] to-[#ffd7e9]' },
  { label: 'Priority Profile Visibility', icon: Crown, color: 'from-[#ffe7f3] to-[#ffd9ea]' },
  { label: 'Read Receipts', icon: CheckCircle2, color: 'from-[#fff1f6] to-[#ffe4ef]' },
  { label: 'Priority Support', icon: Headphones, color: 'from-[#ffedf5] to-[#ffdce9]' },
];

const floatingParticles = [
  { top: '14%', left: '8%', size: 12, color: 'rgba(255,79,139,0.24)', delay: 0 },
  { top: '20%', left: '72%', size: 10, color: 'rgba(255,111,168,0.22)', delay: 0.4 },
  { top: '30%', left: '42%', size: 18, color: 'rgba(248,200,78,0.22)', delay: 0.8 },
  { top: '64%', left: '12%', size: 14, color: 'rgba(255,144,180,0.22)', delay: 1.2 },
  { top: '58%', left: '82%', size: 16, color: 'rgba(255,226,239,0.24)', delay: 1.6 },
];

const petals = [
  { left: '12%', delay: 0.1 },
  { left: '28%', delay: 0.4 },
  { left: '45%', delay: 0.6 },
  { left: '62%', delay: 0.2 },
  { left: '78%', delay: 0.8 },
];

const PremiumTrialModal = ({ open, onClose, onContinue, trialEndDate, userName }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialEndDate) - new Date()) / 86400000))
    : 10;

  useEffect(() => {
    if (!open) return;
    setDimensions({
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });
    setShowConfetti(true);
    const timer = window.setTimeout(() => setShowConfetti(false), 5600);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex min-h-screen items-center justify-center px-3 py-4 sm:px-6 sm:py-5"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/70 backdrop-blur-xl"
          onClick={onClose}
        />

        {showConfetti && dimensions.width > 0 && (
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            numberOfPieces={140}
            recycle={false}
            gravity={0.25}
            wind={0.02}
            colors={[PRIMARY, SECONDARY, '#FFB3C9', '#FFEBF2', GOLD]}
            initialVelocityX={20}
            friction={0.96}
          />
        )}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-pink-200/70 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full bg-rose-200/70 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-[#fff0f6]/70 blur-2xl" />

          {floatingParticles.map((particle, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                top: particle.top,
                left: particle.left,
              }}
              animate={{ y: [0, -12, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3.4, repeat: Infinity, delay: particle.delay }}
            />
          ))}

          {petals.map((petal, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-pink-100/90 shadow-[0_0_20px_rgba(255,111,168,0.18)]"
              style={{ width: 12, height: 12, top: '-8%', left: petal.left }}
              animate={{ y: ['-8%', '105%'], rotate: [0, 30, -12, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.84, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-[min(96vw,56rem)] max-h-[calc(100vh-3rem)] overflow-y-auto overflow-x-hidden rounded-[32px] border border-white/50 bg-white/95 p-5 shadow-[0_40px_120px_rgba(255,79,139,0.16)] backdrop-blur-xl sm:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ffd6e4] bg-white/90 text-[#7B5B69] shadow-sm transition hover:bg-rose-50"
            aria-label="Close welcome modal"
          >
            <X size={20} />
          </button>

          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#ffe9f1] to-transparent opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#fff0f6] to-transparent opacity-80" />

          <div className="relative rounded-[32px] bg-white/90 p-6 shadow-[inset_0_0_0_1px_rgba(255,79,139,0.08)] ring-1 ring-white/60 sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#ff6fa8] to-[#ff4f8b] text-white shadow-[0_20px_60px_rgba(255,79,139,0.18)] sm:h-24 sm:w-24">
                <span className="text-4xl">🎁❤️</span>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF6FA8]">Congratulations!</p>
              <h2 className="mt-4 text-3xl font-bold text-[#4B1D31] sm:text-4xl">
                Welcome to Elovia Love{userName ? `, ${userName.split(' ')[0]}` : ''} ❤️
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-sm leading-7 text-[#7B5B69] sm:text-base">
                As a special welcome gift, you’ve unlocked a full Premium trial. Enjoy every feature and start connecting with meaningful matches today.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-[#FFF3F8] border border-[#FFE5EF] p-6 text-center shadow-[0_20px_80px_rgba(255,111,168,0.14)]">
              <span className="inline-flex rounded-full bg-[#FF6FA8] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-sm">
                Welcome Gift</span>
              <p className="mt-4 text-xl font-semibold text-[#4B1D31] sm:text-2xl">
                <span className="bg-gradient-to-r from-[#FF4F8B] to-[#FF6FA8] bg-clip-text text-transparent">10 Days of Premium FREE</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[#7B5B69]">
                Enjoy all Premium features completely FREE for the next 10 days. No coupon required. Your free trial starts today.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group rounded-[28px] border border-[#ffe8f1] bg-[#FFF3F8] p-4 shadow-sm transition-shadow hover:shadow-[0_24px_70px_rgba(255,111,168,0.12)]"
                    >
                      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-[#4B1D31] shadow-inner`}>
                        <Icon size={18} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#4B1D31]">{feature.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                className="rounded-[32px] bg-gradient-to-br from-[#FFEEF4] to-[#FFF3F8] p-6 text-[#4B1D31] shadow-[0_30px_80px_rgba(255,111,168,0.14)]"
              >
                <div className="flex items-center justify-between gap-4 rounded-[28px] bg-white/80 px-4 py-3 shadow-sm ring-1 ring-white/70">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#FF6FA8]">Free Premium</p>
                    <p className="mt-2 text-4xl font-bold text-[#4B1D31]">10</p>
                  </div>
                  <div className="rounded-3xl bg-[#FF6FA8] px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(255,79,139,0.24)]">
                    DAYS
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-[#ffe5ef]/80">
                    <p className="text-sm font-semibold text-[#4B1D31]">Expires on</p>
                    <p className="mt-1 text-lg font-bold text-[#7B5B69]">{formatDate(trialEndDate)}</p>
                  </div>
                  <div className="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-[#ffe5ef]/80">
                    <p className="text-sm font-semibold text-[#4B1D31]">Estimated premium value</p>
                    <p className="mt-1 text-lg font-bold text-[#7B5B69]">Worth ₹999</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF6FA8] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(255,79,139,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(255,79,139,0.32)] sm:w-auto"
              >
                ❤️ Start Exploring
              </button>
              <Link
                to="/pricing"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#FFB3CC] bg-[#FFF1F6] px-6 py-4 text-base font-semibold text-[#4B1D31] transition hover:bg-[#FFE5EF] sm:w-auto"
              >
                ✨ View Premium Benefits
              </Link>
            </div>

            <p className="mt-6 text-center text-sm leading-6 text-[#7B5B69]">
              Enjoy your premium experience and start making meaningful connections today.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumTrialModal;
