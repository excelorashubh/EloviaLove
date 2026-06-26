import { motion } from 'framer-motion';
import { Shield, Heart, Lock, Users, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * TrustBadges - Display trust elements to build credibility
 */
const TrustBadges = ({ variant = 'horizontal', className = '' }) => {
  const badges = [
    {
      icon: CheckCircle2,
      text: 'Verified Profiles',
      color: 'text-green-500',
    },
    {
      icon: Sparkles,
      text: 'AI Matchmaking',
      color: 'text-amber-500',
    },
    {
      icon: Shield,
      text: 'Safe & Secure',
      color: 'text-blue-500',
    },
    {
      icon: Heart,
      text: 'Serious Relationships',
      color: 'text-pink-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`
        ${variant === 'horizontal' ? 'flex flex-wrap justify-center gap-4' : 'space-y-3'}
        ${className}
      `}
    >
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-sm"
        >
          <badge.icon size={16} className={badge.color} />
          <span className="text-sm font-semibold text-slate-700">
            {badge.text}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TrustBadges;
