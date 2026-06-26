import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, User, Calendar, MapPin, Briefcase, Upload, Lock, 
  ArrowRight, ArrowLeft, Mail
} from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';

// Premium components
import AuthBackground from '../components/auth/AuthBackground';
import GlassCard from '../components/auth/GlassCard';
import PremiumInput from '../components/auth/PremiumInput';
import PremiumButton from '../components/auth/PremiumButton';

const TOTAL_STEPS = 6;

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    interestedIn: '',
    dateOfBirth: '',
    location: '',
    profession: '',
    photo: null,
    email: '',
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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
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
        location: formData.location,
        profession: formData.profession,
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

  // Progress calculation
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <>
      <Helmet>
        <title>Join Elovia Love — Start Your Journey to True Love</title>
        <meta name="description" content="Create your verified profile and connect with serious singles looking for meaningful relationships." />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <AuthBackground />

      {/* Standalone auth page - 100vh, centered */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="h-screen w-full flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-2xl overflow-y-auto max-h-screen custom-scrollbar">
            <div className="py-8">
              <GlassCard className="p-6 sm:p-10">
                
                {/* Header */}
                <div className="text-center mb-6">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF4E7A] to-[#FF7AA8] rounded-[20px] mb-4 shadow-xl shadow-pink-500/30 hover:scale-110 transition-transform duration-300"
                  >
                    <Heart size={32} className="text-white" fill="currentColor" />
                  </Link>
                  <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#2B2B2B] mb-2 tracking-tight">
                    Let's Find Your Perfect Match ❤️
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    Step {currentStep} of {TOTAL_STEPS}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF4E7A] to-[#FF7AA8]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
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

                {/* Steps */}
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1: Name */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          What should people call you?
                        </h2>
                        <PremiumInput
                          id="name"
                          name="name"
                          type="text"
                          label="Display Name"
                          icon={User}
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Priya, Raj"
                        />
                        <PremiumButton onClick={handleNext} icon={ArrowRight}>
                          Continue
                        </PremiumButton>
                      </motion.div>
                    )}

                    {/* Step 2: Gender */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          I'm a
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                          {['Male', 'Female', 'Non-binary'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, gender: option }));
                                setTimeout(handleNext, 300);
                              }}
                              className={`
                                p-4 sm:p-6 rounded-2xl border-2 font-bold text-sm sm:text-lg transition-all
                                ${formData.gender === option
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-slate-200 hover:border-primary-300 text-slate-700'
                                }
                              `}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Interested In */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          Interested In
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                          {['Men', 'Women', 'Everyone'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, interestedIn: option }));
                                setTimeout(handleNext, 300);
                              }}
                              className={`
                                p-4 sm:p-6 rounded-2xl border-2 font-bold text-sm sm:text-lg transition-all
                                ${formData.interestedIn === option
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-slate-200 hover:border-primary-300 text-slate-700'
                                }
                              `}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Details */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-5"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          Tell us about yourself
                        </h2>
                        <PremiumInput
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          label="Date of Birth"
                          icon={Calendar}
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                        />
                        <PremiumInput
                          id="location"
                          name="location"
                          type="text"
                          label="City"
                          icon={MapPin}
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., Mumbai, Delhi"
                        />
                        <PremiumInput
                          id="profession"
                          name="profession"
                          type="text"
                          label="Profession"
                          icon={Briefcase}
                          value={formData.profession}
                          onChange={handleChange}
                          placeholder="e.g., Software Engineer"
                        />
                        <PremiumButton onClick={handleNext} icon={ArrowRight}>
                          Continue
                        </PremiumButton>
                      </motion.div>
                    )}

                    {/* Step 5: Photo (Placeholder) */}
                    {currentStep === 5 && (
                      <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          Upload Your Best Photo
                        </h2>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center hover:border-primary-400 transition-colors">
                          <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                          <p className="text-slate-600 font-medium">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            JPG, PNG up to 10MB
                          </p>
                        </div>
                        <PremiumButton onClick={handleNext} icon={ArrowRight}>
                          Skip for Now
                        </PremiumButton>
                      </motion.div>
                    )}

                    {/* Step 6: Account */}
                    {currentStep === 6 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-5"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                          Secure Your Account
                        </h2>
                        <PremiumInput
                          id="email"
                          name="email"
                          type="email"
                          label="Email Address"
                          icon={Mail}
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                        />
                        <PremiumInput
                          id="password"
                          name="password"
                          type="password"
                          label="Password"
                          icon={Lock}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          showPasswordToggle
                        />
                        <PremiumInput
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          label="Confirm Password"
                          icon={Lock}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          showPasswordToggle
                        />
                        
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="terms"
                            checked={formData.terms}
                            onChange={handleChange}
                            className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                          />
                          <span className="text-sm text-slate-600">
                            I agree to the{' '}
                            <Link to="/terms-of-service" className="text-primary-600 font-semibold hover:text-pink-600">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy-policy" className="text-primary-600 font-semibold hover:text-pink-600">
                              Privacy Policy
                            </Link>
                          </span>
                        </label>

                        <PremiumButton
                          type="submit"
                          loading={loading}
                          icon={Heart}
                        >
                          Create My Profile
                        </PremiumButton>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* Navigation */}
                  {currentStep > 1 && currentStep < 6 && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-semibold transition-colors"
                      >
                        <ArrowLeft size={20} />
                        Back
                      </button>
                    </div>
                  )}
                </form>

                {/* Login link */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-primary-600 hover:text-pink-600 transition-colors"
                    >
                      Sign In
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
