import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, EyeOff, Eye, User, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.terms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dob,
        gender: formData.gender
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

  // Password strength logic (simple for UI purposes)
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);
  
  const StrengthMeterList = [
    { color: 'bg-red-500', label: 'Weak' },
    { color: 'bg-orange-500', label: 'Fair' },
    { color: 'bg-yellow-500', label: 'Good' },
    { color: 'bg-green-500', label: 'Strong' },
    { color: 'bg-emerald-600', label: 'Very Strong' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      <Helmet>
        <title>Sign Up for Elovia Love — Start Your Verified Dating Profile</title>
        <meta name="description" content="Create your Elovia Love profile and connect with verified singles who are serious about relationships." />
        <link rel="canonical" href="https://elovialove.com/signup" />
      </Helmet>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-pink-200 to-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/3 translate-y-1/3" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-10 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100/50 backdrop-blur-sm"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center flex flex-col items-center">
            <Link to="/" className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-primary-500 to-pink-500 rounded-2xl mb-4 group hover:rotate-12 transition-transform duration-300 shadow-xl shadow-pink-500/25">
              <Heart size={32} className="text-white" fill="currentColor" />
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Join Elovia Love</h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Your journey to finding true connection starts here.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-all sm:text-sm font-medium text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>

               {/* Date of Birth */}
               <div className="space-y-2">
                <label htmlFor="dob" className="block text-sm font-semibold text-slate-700">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-all sm:text-sm font-medium text-slate-900 text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email Field */}
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-all sm:text-sm font-medium text-slate-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              {/* Gender */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  {['Male', 'Female', 'Non-binary'].map((gender) => (
                    <label key={gender} className="flex-1">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={gender} 
                        checked={formData.gender === gender}
                        onChange={handleInputChange}
                        className="peer sr-only" 
                      />
                      <div className="text-center py-3 border border-slate-200 rounded-xl cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600">
                        {gender}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-all sm:text-sm font-medium text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength UI */}
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level} 
                          className={`flex-1 ${level <= strength ? StrengthMeterList[strength - 1].color : 'bg-transparent'} transition-colors duration-300`} 
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold px-1">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider">Password Strength</span>
                      <span className={strength > 0 ? StrengthMeterList[strength - 1].color.replace('bg-', 'text-') : 'text-slate-400'}>
                        {strength > 0 ? StrengthMeterList[strength - 1].label : 'Too short'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

               {/* Confirm Password Field */}
               <div className="space-y-2 sm:col-span-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 focus:bg-white transition-all sm:text-sm font-medium text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.terms}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 font-medium cursor-pointer">
                I agree to the <a href="#" className="font-semibold text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-primary-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/25 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-pink-500 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm font-medium">
              <span className="text-slate-500">Already have an account? </span>
              <Link to="/login" className="font-bold text-primary-600 hover:text-pink-600 transition-colors">
                Log in instead
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
