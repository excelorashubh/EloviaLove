import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

      {/* Full-screen container */}
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        
        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-400"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0.3
              }}
              animate={{
                y: -100,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <div className="h-screen w-full flex">
          
          {/* Left Side - Hero (55%) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-pink-200 via-rose-200 to-purple-300 items-center justify-center"
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/45 to-black/60" />
            
            {/* Content */}
            <div className="relative z-10 text-center px-12 max-w-2xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {/* Main Heading */}
                <h1 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                  Every Love Story<br />Begins With One Hello ❤️
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl text-white/90 mb-12 font-light">
                  Find meaningful relationships with verified singles across India
                </p>

                {/* Trust Badges - Single Row */}
                <div className="grid grid-cols-4 gap-4 text-white/90">
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-2" size={20} />
                    <p className="text-sm font-medium">Verified<br />Profiles</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-2" size={20} />
                    <p className="text-sm font-medium">AI<br />Matchmaking</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-2" size={20} />
                    <p className="text-sm font-medium">Safe &<br />Secure</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-2" size={20} />
                    <p className="text-sm font-medium">Serious<br />Relationship</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Login Card (45%) */}
          <div className="w-full lg:w-[45%] flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[430px]"
            >
              {/* Glassmorphism Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl shadow-pink-200/50 p-10">
                
                {/* Logo */}
                <Link
                  to="/"
                  className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#FF4E7A] to-[#FF7AA8] rounded-2xl mb-8 shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <Heart size={28} className="text-white" fill="currentColor" />
                </Link>

                {/* Header */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ❤️ Welcome Back
                </h2>
                <p className="text-gray-600 mb-8">
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
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                        placeholder="you@example.com"
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
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
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
                    <Link to="#" className="text-pink-600 hover:text-pink-700 font-semibold">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#FF4E7A] to-[#FF7AA8] text-white py-4 rounded-full font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Heart size={18} fill="currentColor" />
                        Continue Finding Love
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
                  <Link to="/signup" className="text-pink-600 hover:text-pink-700 font-semibold">
                    Create Account →
                  </Link>
                </p>

                {/* Minimal Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
                  <Link to="/privacy-policy" className="hover:text-pink-600">Privacy</Link>
                  <span>·</span>
                  <Link to="/terms-of-service" className="hover:text-pink-600">Terms</Link>
                  <span>·</span>
                  <Link to="/contact" className="hover:text-pink-600">Support</Link>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                  © 2026 Elovia Love
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
