import { createElement, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Globe2,
  Heart,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  MessageCircleHeart,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { useAuth } from '../context/AuthContext';
import backgroundImage from '../assets/Loginimg.png';
import Logo from '../assets/EloviaLoveWB.png';

const PLATFORM_STATS = [
  { icon: Globe2, value: '50+', label: 'Countries' },
  { icon: MapPin, value: '500+', label: 'Cities' },
  { icon: Users, value: '50,000+', label: 'Verified Members' },
  { icon: MessageCircleHeart, value: '1M+', label: 'Conversations' },
  { icon: ShieldCheck, value: '24–48 hrs', label: 'Avg Verification' },
  { icon: HeartHandshake, value: '85%', label: 'Response Rate' },
];

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
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const destination = location.state?.from;
      const redirectPath = typeof destination === 'string'
        ? destination
        : `${destination?.pathname || ''}${destination?.search || ''}${destination?.hash || ''}`;
      navigate(
        redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/dashboard',
        { replace: true }
      );
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

      <div className="min-h-screen bg-[#fff3f7] p-0 text-slate-900 lg:p-5">
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-5 lg:min-h-[calc(100vh-40px)] lg:flex-row">
          <section
            className="relative hidden min-h-[720px] flex-1 overflow-hidden rounded-[28px] bg-cover bg-center lg:flex"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-label="Elovia Love dating community"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/20" />

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
                  #1 Dating App for <span className="text-[#ff6b98]">Genuine Connections</span>
                </h1>
                <div className="my-5 h-1 w-24 rounded-full bg-[#ff4d83]" />
                <p className="text-base leading-relaxed text-white/90 xl:text-lg">
                  Find meaningful relationships with verified singles worldwide <span aria-hidden="true">❤️</span>
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

          <main className="flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-7 lg:max-w-[560px] lg:px-4 lg:py-0">
            <div className="w-full max-w-[480px]">
              <Link to="/" className="mb-5 flex items-center justify-center gap-2 lg:hidden">
                <img src={Logo} alt="" className="h-9 w-auto" />
                <span className="text-2xl font-bold text-slate-900">
                  Elovia <span className="text-[#f62970]">Love</span>
                </span>
              </Link>

              <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_20px_70px_rgba(246,41,112,0.12)] sm:p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f62970]/35 bg-[#fff1f5] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d91f60]">
                  <span className="h-2 w-2 rounded-full bg-[#f62970]" />
                  Secure access
                </div>

                <h2 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
                  Welcome Back <span aria-hidden="true">❤️</span>
                </h2>
                <p className="mb-7 text-center text-sm leading-6 text-slate-500">
                  Continue your journey to meaningful connections.
                </p>

                {error && (
                  <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-800">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#fffafb] py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#f62970] focus:ring-4 focus:ring-[#f62970]/10"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-800">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#fffafb] py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#f62970] focus:ring-4 focus:ring-[#f62970]/10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 accent-[#f62970] focus:ring-[#f62970]"
                      />
                      <span>Remember Me</span>
                    </label>
                    <Link to="/contact" className="font-semibold text-[#e52365] transition-colors hover:text-[#bd154e]">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff3069] px-5 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(255,48,105,0.25)] transition hover:bg-[#e5235d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <span className="h-px flex-1 bg-pink-200" />
                  <span>OR CONTINUE WITH</span>
                  <span className="h-px flex-1 bg-pink-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-pink-50">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-pink-50">
                    <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.98h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.34l-.53 3.49h-2.81V24C19.61 23.1 24 18.1 24 12.07z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  New here?{' '}
                  <Link to="/signup" className="font-bold text-[#e52365] hover:text-[#bd154e]">
                    Create your account
                  </Link>
                </p>

                <div className="mt-6 border-t border-[#f0edf2] pt-5">
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-400">
                    <Link to="/terms-of-service" className="transition-colors hover:text-[#e52365]">Terms of Service</Link>
                    <span>·</span>
                    <Link to="/privacy-policy" className="transition-colors hover:text-[#e52365]">Privacy Policy</Link>
                    <span>·</span>
                    <Link to="/contact" className="transition-colors hover:text-[#e52365]">Contact</Link>
                  </div>
                  <p className="mt-3 text-center text-[11px] text-slate-400">
                    © {new Date().getFullYear()} Elovia Love
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Login;
