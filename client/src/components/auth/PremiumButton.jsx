import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * PremiumButton - Gradient button with premium animations
 * Features: Gradient background, hover effects, loading state
 */
const PremiumButton = ({
  children,
  type = 'button',
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon: Icon,
  fullWidth = true,
  className = '',
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#FF4E7A] to-[#FF7AA8] text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40',
    secondary: 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 shadow-md',
    outline: 'bg-transparent text-primary-600 border-2 border-primary-500 hover:bg-primary-50',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        relative
        ${fullWidth ? 'w-full' : 'inline-flex'}
        flex items-center justify-center gap-2
        py-4 px-6
        rounded-2xl
        font-bold text-base
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {/* Loading Spinner */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Loader2 className="animate-spin" size={20} />
        </motion.div>
      )}

      {/* Content */}
      <span className={loading ? 'opacity-0' : 'flex items-center gap-2'}>
        {Icon && <Icon size={20} />}
        {children}
      </span>

      {/* Shine effect */}
      {!isDisabled && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
};

export default PremiumButton;
