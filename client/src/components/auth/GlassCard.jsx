import { motion } from 'framer-motion';

/**
 * GlassCard - Premium glassmorphism card component
 * Features: Backdrop blur, subtle borders, smooth shadows
 */
const GlassCard = ({ children, className = '', animate = true }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: "hidden",
    animate: "visible",
    variants: cardVariants,
  } : {};

  return (
    <CardComponent
      className={`
        relative
        bg-white/85
        backdrop-blur-2xl
        rounded-[30px]
        shadow-2xl shadow-pink-500/10
        border border-white/40
        overflow-hidden
        ${className}
      `}
      {...animationProps}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none rounded-[30px]" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </CardComponent>
  );
};

export default GlassCard;
