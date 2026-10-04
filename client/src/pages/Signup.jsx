import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  Mars,
  ShieldCheck,
  Sparkles,
  User,
  Venus,
} from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';


const TRIAL_WELCOME_KEY = 'elovia_premium_trial_welcome';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: Mars },
  { value: 'Female', label: 'Female', icon: Venus },
  { value: 'Non-binary', label: 'Non-binary', icon: Sparkles },
];

const PASSWORD_REQUIREMENTS = [
  { label: '8+ characters', test: (password) => password.length >= 8 },
  { label: 'One letter', test: (password) => /[A-Za-z]/.test(password) },
  { label: 'One number', test: (password) => /\d/.test(password) },
  { label: 'One symbol', test: (password) => /[^A-Za-z0-9]/.test(password) },
];

const fieldBaseClass =
  'w-full rounded-2xl border border-white/10 bg-[#111417] px-4 py-3.5 text-sm text-white placeholder:text-white/35 transition-all duration-200 focus:border-[#ff2d68] focus:outline-none focus:ring-2 focus:ring-[#ff2d68]/20';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email || '');

const getPasswordStrength = (password) => {
  const score = PASSWORD_REQUIREMENTS.filter((item) => item.test(password)).length;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-[#ff5b7f]' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-[#ff8bb0]' };
  return { score, label: 'Strong', color: 'bg-[#ff2d68]' };
};

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = useMemo(
    () => PASSWORD_REQUIREMENTS.map((requirement) => ({ ...requirement, valid: requirement.test(formData.password) })),
    [formData.password]
  );

  const passwordStrength = getPasswordStrength(formData.password);
  const isFormValid =
    formData.name.trim() &&
    isValidEmail(formData.email) &&
    formData.dateOfBirth &&
    formData.gender &&
    passwordChecks.every((rule) => rule.valid) &&
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0 &&
    formData.terms;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!isValidEmail(formData.email)) nextErrors.email = 'Enter a valid email address';
    if (!formData.dateOfBirth) nextErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) nextErrors.gender = 'Please select your gender';

    const passwordRules = PASSWORD_REQUIREMENTS.filter((rule) => !rule.test(formData.password));
    if (passwordRules.length) nextErrors.password = 'Password does not meet all requirements';
    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!formData.terms) nextErrors.terms = 'Please accept the Terms of Service and Privacy Policy';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please fix the highlighted fields and try again.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      if (result.success) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(TRIAL_WELCOME_KEY, 'true');
        }
        navigate('/dashboard');
      } else {
        setSubmitError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Join Elovia Love — Create Your Love Story</title>
        <meta name="description" content="Create your verified profile and discover genuine connections made for something real." />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#050505] text-white lg:h-screen lg:overflow-hidden"
      // style={{
      //   backgroundImage:
      //     `url(${signup})`,
      // }}
      >
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:h-screen lg:flex-row lg:items-stretch">
          <div className="hidden relative overflow-hidden border-b border-white/10 bg-[#090b10] lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[52%] lg:shrink-0 lg:border-b-0 lg:border-r">
            {/* Romantic background image + dark gradient overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            // style={{
            //   backgroundImage:
            //     `url(${signup})`,
            // }}
            />
            <div className="absolute inset-0 bg-[#050505]/55" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/90 via-[#050505]/55 to-[#ff2d68]/25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,45,104,0.24),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,65,108,0.18),_transparent_34%)]" />

            {/* Left Panel */}

            <div className="relative z-10 flex min-h-full flex-col px-5 py-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10">
                  <Heart className="h-5 w-5 text-[#ff2d68]" fill="currentColor" strokeWidth={2.2} />
                </div>
                <div className="text-[1.7rem] font-semibold tracking-[-0.04em]">
                  <span className="text-white">Elovia</span>
                  <span className="text-[#ff2d68]"> Love</span>
                </div>
              </div>

              <div className="relative mt-7 text-sm font-medium tracking-[0.22em] text-white/70 uppercase">Connect · Chat · Find Love</div>

              {/* <div className="relative mt-10 min-h-[62px]"> */}
              <div className="absolute right-5 top-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
                <div className="flex -space-x-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#090b10] bg-[#ff2d68]/15 text-[#ff6f96]">
                    <Heart className="h-3.5 w-3.5" fill="currentColor" strokeWidth={2.2} />
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#090b10] bg-white/10 text-white/75">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#090b10] bg-[#ff2d68]/10 text-[#ff9db5]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                </div>
                <div className="pr-1">
                  <p className="text-[11px] font-semibold leading-none text-white/90">Made for something real</p>
                  <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">Genuine · Meaningful · Safe</p>
                </div>
              </div>
              {/* </div> */}

              <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffb9c9]">
                <ShieldCheck className="h-4 w-4 text-[#ff2d68]" />
                Trusted dating platform
              </div>

              <div className="mt-6 max-w-[560px]">
                <h1 className="text-[clamp(2.7rem,4vw,5rem)] font-black leading-[0.95] tracking-[-0.06em] text-white">
                  Every Love Story<br />
                  <span className="text-[#ff2d68]">Begins With One Hello ❤️</span>
                </h1>
                <p className="mt-6 max-w-[500px] text-[1.06rem] leading-8 text-white/75 sm:text-[1.2rem]">
                  Find meaningful relationships with verified singles across India.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/3 lg:max-w-[620px]">
                {[
                  { icon: ShieldCheck, label: 'Verified Profiles' },
                  { icon: BrainCircuit, label: 'AI Matchmaking' },
                  { icon: Lock, label: 'Safe & Secure' },
                  { icon: Heart, label: 'Serious Relationships' },
                ].map(({ icon: Icon, label }, index) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 px-4 py-4 ${index !== 3 ? 'border-b border-r border-white/10' : 'border-b border-white/10'} ${index >= 2 ? 'border-b-0' : ''}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10 text-[#ff2d68]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-white/90">{label}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Panel */}

          <div className="flex w-full items-start justify-center bg-[#050505] px-4 py-8 sm:px-6 lg:h-screen lg:w-[50%] lg:overflow-y-auto custom-scrollbar lg:px-7 lg:py-10 xl:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-[720px] lg:my-auto"
            >
              <div className="rounded-[28px] border border-white/10 bg-[#0b0d11]/95 p-2 shadow-[0_24px_80px_rgba(255,45,104,0.08)] sm:p-7 lg:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10">
                    <Heart className="h-5 w-5 text-[#ff2d68]" fill="currentColor" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ff2d68]/30 bg-[#ff2d68]/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff7ea2]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#ff2d68]" />
                  Secure access
                </div>

                <h2 className="mb-2 text-[clamp(2rem,2.7vw,2.8rem)] font-bold leading-tight tracking-[-0.06em] text-white">
                  Your Love Story Starts <span className="text-[#ff2d68]">Here ❤️</span>
                </h2>
                <p className="mb-7 text-[0.96rem] leading-7 text-white/60">
                  Create your profile and discover genuine connections made for something real.
                </p>

                {submitError && (
                  <div className="mb-5 rounded-2xl border border-[#ff2d68]/40 bg-[#ff2d68]/8 px-4 py-3 text-sm text-[#ffb7c8]">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`${fieldBaseClass} pl-11 ${errors.name ? 'border-[#ff5f89] ring-[#ff5f89]/20' : ''}`}
                          placeholder="John Doe"
                          aria-invalid={!!errors.name}
                        />
                      </div>
                      {errors.name && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${fieldBaseClass} pl-11 ${errors.email ? 'border-[#ff5f89] ring-[#ff5f89]/20' : ''}`}
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                        />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`${fieldBaseClass} pl-11 ${errors.dateOfBirth ? 'border-[#ff5f89] ring-[#ff5f89]/20' : ''}`}
                        aria-invalid={!!errors.dateOfBirth}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => {
                        const isSelected = formData.gender === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, gender: value }));
                              setErrors((prev) => ({ ...prev, gender: '' }));
                            }}
                            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${isSelected
                              ? 'border-[#ff2d68] bg-[#ff2d68]/10 text-[#ff9db0] shadow-[0_0_0_1px_rgba(255,45,104,0.25)]'
                              : 'border-white/10 bg-[#111417] text-white/75 hover:border-white/20 hover:bg-[#161b20]'
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.gender && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${fieldBaseClass} pl-11 pr-11 ${errors.password ? 'border-[#ff5f89] ring-[#ff5f89]/20' : ''}`}
                        placeholder="Create a strong password"
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 transition-colors hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/10 bg-[#111417] p-3">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">
                        <span>Password strength</span>
                        <span className={passwordStrength.label === 'Weak' ? 'text-[#ff7ea2]' : passwordStrength.label === 'Good' ? 'text-[#ffb6cb]' : 'text-[#ff4f87]'}>
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className="mb-3 flex gap-1.5">
                        {[0, 1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${level < passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                              }`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-white/65">
                        {passwordChecks.map((requirement) => (
                          <div key={requirement.label} className="flex items-center gap-2">
                            {requirement.valid ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff2d68]/10 text-[#ff2d68]">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-white/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              </span>
                            )}
                            <span>{requirement.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${fieldBaseClass} pl-11 pr-11 ${errors.confirmPassword ? 'border-[#ff5f89] ring-[#ff5f89]/20' : ''}`}
                        placeholder="Confirm your password"
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 transition-colors hover:text-white"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1.5 text-xs text-[#ff9db0]">{errors.confirmPassword}</p>}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-[#111417] px-3 py-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-white/15 bg-[#111417] text-[#ff2d68] focus:ring-[#ff2d68]"
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="font-medium text-[#ff8bb0] underline underline-offset-2 hover:text-[#ffb7c8]">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="font-medium text-[#ff8bb0] underline underline-offset-2 hover:text-[#ffb7c8]">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && <p className="-mt-2 text-xs text-[#ff9db0]">{errors.terms}</p>}

                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff2d68] to-[#ff416c] px-5 py-4 text-base font-bold text-white shadow-[0_16px_36px_rgba(255,45,104,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(255,45,104,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create My Account <span aria-hidden="true">❤️</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/65">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#ff5f89] underline-offset-2 hover:text-[#ff8bb0]">
                    Sign In
                  </Link>
                </p>

                <div className="mt-7 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-center gap-3 text-xs text-white/45">
                    <Link to="/privacy-policy" className="transition-colors hover:text-[#ff9db0]">Privacy</Link>
                    <span>·</span>
                    <Link to="/terms-of-service" className="transition-colors hover:text-[#ff9db0]">Terms</Link>
                    <span>·</span>
                    <Link to="/contact" className="transition-colors hover:text-[#ff9db0]">Support</Link>
                  </div>
                  <p className="mt-3 text-center text-[11px] text-white/30">© 2026 Elovia Love</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
