import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PremiumInput - Modern floating label input with premium styling
 * Features: Floating labels, smooth animations, icon support
 */
const PremiumInput = ({
  id,
  name,
  type = 'text',
  label,
  icon: Icon,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  placeholder = '',
  autoComplete,
  className = '',
  showPasswordToggle = false,
  error = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;
  const isActive = isFocused || hasValue;

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container */}
      <div
        className={`
          relative
          rounded-2xl
          border-2
          transition-all duration-300
          ${isFocused
            ? 'border-primary-500 bg-white shadow-lg shadow-primary-500/20'
            : error
            ? 'border-red-300 bg-red-50/50'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }
        `}
      >
        {/* Icon */}
        {Icon && (
          <div
            className={`
              absolute left-4 top-1/2 -translate-y-1/2
              transition-all duration-300
              ${isFocused ? 'text-primary-600' : 'text-slate-400'}
            `}
          >
            <Icon size={20} />
          </div>
        )}

        {/* Floating Label */}
        <motion.label
          htmlFor={id}
          className={`
            absolute left-${Icon ? '12' : '4'} pointer-events-none
            font-medium
            transition-all duration-300
            ${isFocused || hasValue
              ? 'top-2 text-xs text-primary-600'
              : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'
            }
          `}
          initial={false}
          animate={{
            top: isActive ? '8px' : '50%',
            fontSize: isActive ? '0.75rem' : '0.875rem',
            translateY: isActive ? '0%' : '-50%',
          }}
        >
          {label}
          {required && <span className="text-primary-500 ml-0.5">*</span>}
        </motion.label>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          required={required}
          placeholder={isActive ? placeholder : ''}
          className={`
            w-full
            ${Icon ? 'pl-12' : 'pl-4'}
            ${showPasswordToggle ? 'pr-12' : 'pr-4'}
            pt-7 pb-3
            bg-transparent
            border-none
            outline-none
            text-slate-900
            text-base
            font-medium
            placeholder:text-slate-400
          `}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-600 font-medium mt-2 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Focus Ring Effect */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-2xl ring-4 ring-primary-500/20 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        />
      )}
    </div>
  );
};

export default PremiumInput;
