import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, User, Calendar, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.terms) {
      setError('Please accept the Terms of Service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Join Elovia Love — Start Your Journey to True Love</title>
        <meta name="description" content="Create your verified profile and connect with serious singles." />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
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

          {/* Right Side - Signup Card (45%) */}
          <div className="w-full lg:w-[45%] flex items-center justify-center p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[430px] my-8"
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
                  Create Your Account
                </h2>
                <p className="text-gray-600 mb-8">
                  Join thousands finding meaningful connections
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

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

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
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
                        placeholder="Create a strong password"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="text-pink-600 hover:text-pink-700 font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-pink-600 hover:text-pink-700 font-semibold">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#FF4E7A] to-[#FF7AA8] text-white py-4 rounded-full font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Heart size={18} fill="currentColor" />
                        Create My Profile
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-pink-600 hover:text-pink-700 font-semibold">
                    Sign In
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

export default Signup;
