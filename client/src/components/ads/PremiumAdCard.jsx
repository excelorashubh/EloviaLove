import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Check, Sparkles, Shield, Zap, Heart } from 'lucide-react';

/**
 * PremiumAdCard - Replaces ads with premium upgrade promotion
 * Shows on pricing page and other strategic locations
 */
const PremiumAdCard = ({ className = '', variant = 'default' }) => {
  const benefits = [
    { icon: Sparkles, text: 'Ad-free experience' },
    { icon: Zap, text: 'Unlimited profile views' },
    { icon: Shield, text: 'Priority AI matching' },
    { icon: Heart, text: 'Read receipts' },
  ];

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br from-primary-50 to-pink-50 border-2 border-primary-200 rounded-2xl p-6 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-pink-500 rounded-xl shrink-0">
            <Crown className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Enjoy Elovia Love Without Ads
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Upgrade to premium for an ad-free experience and exclusive features
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Crown size={16} />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br from-primary-500 via-pink-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-24 -translate-x-24" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
          <Crown size={18} />
          <span className="text-sm font-semibold">Premium</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-2">
          Enjoy Elovia Love <br />
          Without Ads
        </h2>

        {/* Subtitle */}
        <p className="text-white/90 mb-6 text-sm">
          Upgrade to premium and unlock an ad-free experience plus exclusive features
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shrink-0">
                <benefit.icon size={16} />
              </div>
              <span className="text-sm font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white text-primary-600 font-bold rounded-xl hover:bg-white/95 transition-all shadow-lg hover:shadow-xl"
        >
          <Crown size={18} />
          Upgrade to Premium
        </Link>

        {/* Trust badge */}
        <p className="text-center text-white/70 text-xs mt-4">
          ✨ Join 10,000+ premium members
        </p>
      </div>
    </motion.div>
  );
};

export default PremiumAdCard;
