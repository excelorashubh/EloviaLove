import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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
        <meta name="description" content="Continue your journey to meaningful connections." />
        <link rel="canonical" href={`${SITE_URL}/login`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(255,244,247,0.95)_35%,_rgba(248,234,240,0.9)_100%)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-400"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: (typeof window !== 'undefined' ? window.innerHeight : 900) + 100,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0.35
              }}
              animate={{
                y: -120,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              }}
              transition={{
                duration: Math.random() * 12 + 16,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5,
              }}
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row lg:items-center lg:justify-center lg:px-6 xl:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden items-center justify-center overflow-hidden rounded-[30px] bg-cover bg-center bg-no-repeat p-8 shadow-[0_30px_80px_rgba(80,18,39,0.18)] lg:flex lg:w-[54%] lg:max-w-[760px] lg:min-h-[720px]">
            <div
              className="absolute inset-0 rounded-[30px]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(32, 10, 18, 0.30), rgba(58, 17, 27, 0.55), rgba(20, 8, 16, 0.72)), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            />
            <div className="absolute -left-12 top-14 h-40 w-40 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="absolute bottom-16 right-8 h-48 w-48 rounded-full bg-pink-200/20 blur-3xl" />
            <div className="relative z-10 max-w-[540px] text-center text-white">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-100 backdrop-blur-sm">
                  <Sparkles size={14} className="text-pink-200" />
                  Premium matchmaking
                </div>
                <h1 className="mb-6 text-[clamp(2.8rem,4vw,4.5rem)] font-black leading-[1.05] tracking-[-0.04em] text-white">
                  Every Love Story<br />Begins With One Hello ❤️
                </h1>
                <p className="mx-auto mb-10 max-w-[480px] text-lg font-light text-white/90 xl:text-xl">
                  Find meaningful relationships with verified singles across India.
                </p>

                <div className="grid grid-cols-2 gap-3 text-left text-white/90 md:grid-cols-4">
                  {[
                    'Verified Profiles',
                    'AI Matchmaking',
                    'Safe & Secure',
                    'Serious Relationships',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm">
                      <CheckCircle2 className="mb-2 text-pink-200" size={18} />
                      <p className="text-[11px] font-semibold leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-medium text-pink-50/90">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                  Verified profiles • Secure conversations • Genuine connections
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:w-[46%] lg:max-w-[560px] lg:p-6 xl:p-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[500px]"
            >
              <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_30px_90px_rgba(255,123,160,0.16)] backdrop-blur-xl sm:p-8 lg:p-9">
                
                <Link
                  to="/"
                  className="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF4E7A] to-[#FF7AA8] shadow-[0_18px_32px_rgba(255,94,136,0.22)] transition-transform duration-300 hover:scale-105"
                >
                  <Heart size={24} className="text-white" fill="currentColor" />
                </Link>

                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Secure access</span>
                </div>
                <h2 className="mb-2 text-[clamp(2rem,2.7vw,2.5rem)] font-bold tracking-[-0.04em] text-gray-900">
                  Welcome Back ❤️
                </h2>
                <p className="mb-8 text-[15px] leading-6 text-gray-600">
                  Continue your journey to meaningful connections
                </p>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 mr-2"
                      />
                      <span className="text-gray-700 font-medium">Remember Me</span>
                    </label>
                    <Link to="/contact" className="font-semibold text-pink-600 transition-colors hover:text-pink-700">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FD5A7A] to-[#FD2B6B] px-5 py-4 text-base font-bold text-white shadow-[0_16px_38px_rgba(253,90,122,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(253,90,122,0.42)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Continue Finding Love</span>
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">
                        OR CONTINUE WITH
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
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
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Apple
                    </button>
                  </div>
                </form>

                {/* Sign Up Link */}
                <p className="mt-8 text-center text-sm text-gray-600">
                  New here?{' '}
                  <Link to="/signup" className="font-semibold text-pink-600 transition-colors hover:text-pink-700">
                    Create your account →
                  </Link>
                </p>

                <div className="mt-8 flex items-center justify-center gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500">
                  <Link to="/privacy-policy" className="transition-colors hover:text-pink-600">Privacy</Link>
                  <span>·</span>
                  <Link to="/terms-of-service" className="transition-colors hover:text-pink-600">Terms</Link>
                  <span>·</span>
                  <Link to="/contact" className="transition-colors hover:text-pink-600">Support</Link>
                </div>
                <p className="mt-2 text-center text-xs text-gray-400">© 2026 Elovia Love</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
