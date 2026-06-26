import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';

// Premium components
import AuthBackground from '../components/auth/AuthBackground';
import GlassCard from '../components/auth/GlassCard';
import PremiumInput from '../components/auth/PremiumInput';
import PremiumButton from '../components/auth/PremiumButton';
import TrustBadges from '../components/auth/TrustBadges';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Welcome Back — Login to Elovia Love</title>
        <meta name="description" content="Continue your journey to meaningful connections. Access your Elovia Love account securely." />
        <link rel="canonical" href={`${SITE_URL}/login`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Premium animated background */}
      <AuthBackground />

      {/* Standalone auth page - 100vh, no scrolling on desktop */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="h-screen w-full flex items-center justify-center p-4 lg:p-8 relative z-10">
          <div className="w-full max-w-7xl h-full max-h-[900px] flex items-center">
            <div className="grid lg:grid-cols-[55%,45%] gap-0 lg:gap-12 w-full h-full lg:h-auto items-center">
              
              {/* Left side - Hero section (hidden on mobile) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="hidden lg:flex flex-col justify-center space-y-8 h-full"
              >
                {/* Hero image */}
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 via-purple-100 to-primary-100 relative">
                    {/* Romantic gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-primary-500/20" />
                    
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Heart size={120} className="text-pink-400 mx-auto mb-6" fill="currentColor" />
                        </motion.div>
                        
                        <h2 className="text-5xl font-extrabold text-slate-800 mb-4 leading-tight">
                          Every Love Story<br />Begins With One Hello ❤️
                        </h2>
                        
                        <p className="text-lg text-slate-600 font-medium">
                          Join thousands finding meaningful connections
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <TrustBadges />

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center px-4"
                >
                  <p className="text-lg font-bold text-slate-700 mb-2">
                    Trusted by thousands of verified singles across India 🇮🇳
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} size={18} className="text-amber-400" fill="currentColor" />
                    ))}
                    <span className="ml-2 text-base font-bold text-slate-600">4.9/5 Rating</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right side - Login form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full max-w-[480px] mx-auto overflow-y-auto max-h-screen lg:max-h-[900px] custom-scrollbar"
              >
                <div className="py-8 lg:py-0">
                  <GlassCard className="p-8 sm:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <Link
                        to="/"
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF4E7A] to-[#FF7AA8] rounded-[20px] mb-6 shadow-xl shadow-pink-500/30 hover:scale-110 transition-transform duration-300"
                      >
                        <Heart size={32} className="text-white" fill="currentColor" />
                      </Link>
                      <h1 className="text-[32px] font-extrabold text-[#2B2B2B] mb-2 tracking-tight">
                        ❤️ Welcome Back
                      </h1>
                      <p className="text-base text-slate-600 font-medium">
                        Continue your journey...
                      </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                        >
                          <p className="text-sm font-semibold text-red-600 text-center">
                            {error}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email */}
                      <PremiumInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />

                      {/* Password */}
                      <PremiumInput
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        showPasswordToggle
                      />

                      {/* Remember me & Forgot password */}
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                          />
                          <span className="font-semibold text-slate-700">
                            Remember Me
                          </span>
                        </label>

                        <Link
                          to="#"
                          className="font-bold text-primary-600 hover:text-pink-600 transition-colors"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <PremiumButton
                        type="submit"
                        loading={loading}
                        icon={Heart}
                      >
                        Continue Finding Love
                      </PremiumButton>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-white/90 text-slate-500 font-semibold">
                            OR CONTINUE WITH
                          </span>
                        </div>
                      </div>

                      {/* Social Login */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 rounded-2xl font-semibold text-slate-700 text-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-slate-800 transition-all"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                          Apple
                        </button>
                      </div>
                    </form>

                    {/* Sign up link */}
                    <div className="mt-8 text-center">
                      <p className="text-sm text-slate-600">
                        New here?{' '}
                        <Link
                          to="/signup"
                          className="font-bold text-primary-600 hover:text-pink-600 transition-colors"
                        >
                          Create Account →
                        </Link>
                      </p>
                    </div>
                  </GlassCard>

                  {/* Minimal footer */}
                  <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <Link to="/privacy-policy" className="hover:text-primary-600 transition-colors">
                      Privacy
                    </Link>
                    <span>·</span>
                    <Link to="/terms-of-service" className="hover:text-primary-600 transition-colors">
                      Terms
                    </Link>
                    <span>·</span>
                    <Link to="/contact" className="hover:text-primary-600 transition-colors">
                      Support
                    </Link>
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    © 2026 Elovia Love
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
