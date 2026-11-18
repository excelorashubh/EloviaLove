import { createElement, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  Eye,
  EyeOff,
  Globe2,
  Heart,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  Mars,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Venus,
} from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';
import backgroundImage from '../assets/Loginimg.png';
import Logo from '../assets/EloviaLoveWB.png';

const TRIAL_WELCOME_KEY = 'elovia_premium_trial_welcome';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: Mars },
  { value: 'Female', label: 'Female', icon: Venus },
  { value: 'Non-binary', label: 'Non-binary', icon: Sparkles },
];

const PLATFORM_STATS = [
  { icon: Globe2, value: '50+', label: 'Countries' },
  { icon: MapPin, value: '500+', label: 'Cities' },
  { icon: Users, value: '50,000+', label: 'Verified Members' },
  { icon: MessageCircleHeart, value: '1M+', label: 'Conversations' },
  { icon: ShieldCheck, value: '24–48 hrs', label: 'Avg Verification' },
  { icon: HeartHandshake, value: '85%', label: 'Response Rate' },
];

const PASSWORD_REQUIREMENTS = [
  { label: '8+ characters', test: (password) => password.length >= 8 },
  { label: 'One letter', test: (password) => /[A-Za-z]/.test(password) },
  { label: 'One number', test: (password) => /\d/.test(password) },
  { label: 'One symbol', test: (password) => /[^A-Za-z0-9]/.test(password) },
];

const fieldBaseClass =
  'w-full rounded-xl border border-slate-200 bg-[#fffafb] px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#f62970] focus:ring-4 focus:ring-[#f62970]/10';

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
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
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
    } catch {
      setSubmitError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) =>
    `${fieldBaseClass} ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`;

  return (
    <>
      <Helmet>
        <title>Join Elovia Love — Create Your Love Story</title>
        <meta name="description" content="Create your verified profile and discover genuine connections made for something real." />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#fff3f7] p-0 text-slate-900 lg:h-screen lg:overflow-hidden lg:p-5"
      style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              minHeight: "100vh",
            }}
      >
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-5 lg:h-full lg:min-h-0 lg:flex-row lg:items-stretch">
          <section
            className="relative hidden min-h-[680px] flex-1 overflow-hidden rounded-[28px] bg-cover bg-center lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-40px)] lg:min-h-0"
            // style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-label="Elovia Love dating community"
          >
            <div className="absolute inset-0 " />

            <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-8 xl:p-12">
              <div className="flex items-start justify-between gap-5">
                <Link
                  to="/"
                  className="flex flex-col items-center rounded-2xl border border-white/40 bg-black/15 px-5 py-3 backdrop-blur-md"
                >
                  <span className="mb-2 flex items-center gap-2">
                    <img src={Logo} alt="" className="h-8 w-auto" />
                    <span className="text-2xl font-bold text-white">
                      Elovia <span className="text-[#ff4d83]">Love</span>
                    </span>
                  </span>
                  <span className="text-xs text-white/85">Connect <span className="px-1">·</span> Chat <span className="px-1">·</span> Find Love</span>
                </Link>

                <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-black/15 px-4 py-3 backdrop-blur-md">
                  <Heart className="h-6 w-6 shrink-0 text-[#ff4d83]" fill="currentColor" />
                  <div>
                    <p className="text-xs font-semibold text-white">Made for something real</p>
                    <p className="mt-1 text-[10px] text-white/70">Genuine · Meaningful · Safe</p>
                  </div>
                </div>
              </div>

              <div className="max-w-3xl rounded-3xl bg-black/25 p-6 backdrop-blur-sm xl:p-8">
                <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                  Your Love Story <span className="text-[#ff6b98]">Begins Here</span>
                </h1>
                <div className="my-5 h-1 w-24 rounded-full bg-[#ff4d83]" />
                <p className="text-base leading-relaxed text-white/90 xl:text-lg">
                  Meet verified singles and discover genuine connections made for something real.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6 xl:grid-cols-6">
                  {PLATFORM_STATS.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex flex-col items-center text-center text-white">
                      {createElement(Icon, { className: 'mb-2 h-6 w-6 text-pink-300', strokeWidth: 1.8 })}
                      <p className="text-lg font-extrabold tracking-tight">{value}</p>
                      <p className="mt-1 text-[10px] font-medium text-white/85">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
                  {['Verified profiles', 'Safe community', 'Meaningful connections'].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-white">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-pink-300" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <main className="flex w-full flex-1 justify-center px-4 py-6 sm:px-7 lg:h-[calc(100vh-40px)] lg:min-h-0 lg:max-w-[576px] lg:overflow-y-auto custom-scrollbar lg:px-4 lg:py-0">
            <div className="w-full">
              <Link to="/" className="mb-5 flex items-center justify-center gap-2 lg:hidden">
                <img src={Logo} alt="" className="h-9 w-auto" />
                <span className="text-2xl font-bold text-slate-900">
                  Elovia <span className="text-[#f62970]">Love</span>
                </span>
              </Link>

              <div className="w-full rounded-[28px] border border-white bg-white p-5 shadow-[0_20px_70px_rgba(246,41,112,0.12)] sm:p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f62970]/35 bg-[#fff1f5] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d91f60]">
                  <span className="h-2 w-2 rounded-full bg-[#f62970]" />
                  Secure access
                </div>

                <h2 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[1.8rem]">
                  Your Love Story Starts <span className="text-[#f62970]">Here ❤️</span>
                </h2>
                <p className="mb-7 text-sm leading-6 text-slate-500">
                  Create your profile and discover genuine connections made for something real.
                </p>

                {submitError && (
                  <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-slate-800">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="signup-name"
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`${fieldClass('name')} pl-11`}
                          placeholder="Your full name"
                          aria-invalid={!!errors.name}
                        />
                      </div>
                      {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-slate-800">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="signup-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${fieldClass('email')} pl-11`}
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                        />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-date-of-birth" className="mb-2 block text-sm font-semibold text-slate-800">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="signup-date-of-birth"
                        type="date"
                        name="dateOfBirth"
                        autoComplete="bday"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`${fieldClass('dateOfBirth')} pl-11`}
                        aria-invalid={!!errors.dateOfBirth}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1.5 text-xs text-red-600">{errors.dateOfBirth}</p>}
                  </div>

                  <fieldset>
                    <legend className="mb-2 block text-sm font-semibold text-slate-800">Gender</legend>
                    <div className="grid grid-cols-3 gap-2.5">
                      {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => {
                        const isSelected = formData.gender === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setFormData((previous) => ({ ...previous, gender: value }));
                              setErrors((previous) => ({ ...previous, gender: '' }));
                            }}
                            aria-pressed={isSelected}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                              isSelected
                                ? 'border-[#f62970] bg-[#fff1f5] text-[#d91f60] shadow-[0_0_0_1px_rgba(246,41,112,0.12)]'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50'
                            }`}
                          >
                            {createElement(Icon, { className: 'h-4 w-4 shrink-0' })}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.gender && <p className="mt-1.5 text-xs text-red-600">{errors.gender}</p>}
                  </fieldset>

                  <div>
                    <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-slate-800">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${fieldClass('password')} pl-11 pr-11`}
                        placeholder="Create a strong password"
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-pink-100 bg-[#fffafb] p-3">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        <span>Password strength</span>
                        <span className={passwordStrength.label === 'Weak' ? 'text-[#e04469]' : passwordStrength.label === 'Good' ? 'text-[#d97725]' : 'text-[#d91f60]'}>
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className="mb-3 flex gap-1.5">
                        {[0, 1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${level < passwordStrength.score ? passwordStrength.color : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        {passwordChecks.map((requirement) => (
                          <div key={requirement.label} className="flex items-center gap-2">
                            {requirement.valid ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f62970]/10 text-[#d91f60]">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              </span>
                            )}
                            <span>{requirement.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-semibold text-slate-800">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${fieldClass('confirmPassword')} pl-11 pr-11`}
                        placeholder="Confirm your password"
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((previous) => !previous)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-[#fffafb] px-3 py-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#f62970] focus:ring-[#f62970]"
                      />
                      <span>
                        I agree to the{' '}
                        <Link to="/terms-of-service" className="font-semibold text-[#d91f60] underline underline-offset-2 hover:text-[#bd154e]">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy-policy" className="font-semibold text-[#d91f60] underline underline-offset-2 hover:text-[#bd154e]">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff3069] px-5 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(255,48,105,0.25)] transition hover:bg-[#e5235d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create My Account <span aria-hidden="true">❤️</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#e52365] hover:text-[#bd154e]">
                    Sign In
                  </Link>
                </p>

                <div className="mt-6 border-t border-[#f0edf2] pt-5">
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-400">
                    <Link to="/privacy-policy" className="transition-colors hover:text-[#e52365]">Privacy</Link>
                    <span>·</span>
                    <Link to="/terms-of-service" className="transition-colors hover:text-[#e52365]">Terms</Link>
                    <span>·</span>
                    <Link to="/contact" className="transition-colors hover:text-[#e52365]">Support</Link>
                  </div>
                  <p className="mt-3 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} Elovia Love</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Signup;
