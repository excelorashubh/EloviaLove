import { createElement, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
    setFormData((prev) => ({
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

  const fieldBaseClass =
    'w-full rounded-2xl border border-white/10 bg-[#111417] py-3.5 text-sm text-white placeholder:text-white/35 transition-all duration-200 focus:border-[#ff2d68] focus:outline-none focus:ring-2 focus:ring-[#ff2d68]/20';

  return (
    <>
      <Helmet>
        <title>Welcome Back — Login to Elovia Love</title>
        <meta name="description" content="Continue your journey to meaningful connections." />
        <link rel="canonical" href={`${SITE_URL}/login`} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#050505] text-white lg:h-screen lg:overflow-hidden">
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:h-screen lg:flex-row lg:items-stretch">
          <section className="hidden relative overflow-hidden border-b border-white/10 bg-[#090b10] lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[52%] lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 bg-[#050505]/55" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/90 via-[#050505]/55 to-[#ff2d68]/25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,45,104,0.24),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,65,108,0.18),_transparent_34%)]" />

            <div className="relative z-10 flex min-h-full flex-col px-5 py-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
              <Link to="/" className="flex items-center gap-3 self-start">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10">
                  <Heart className="h-5 w-5 text-[#ff2d68]" fill="currentColor" strokeWidth={2.2} />
                </span>
                <span className="text-[1.7rem] font-semibold tracking-[-0.04em]">
                  <span className="text-white">Elovia</span>
                  <span className="text-[#ff2d68]"> Love</span>
                </span>
              </Link>

              <div className="mt-7 text-sm font-medium tracking-[0.22em] text-white/70 uppercase">
                Connect · Chat · Find Love
              </div>

              <div className="absolute right-5 top-10 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md xl:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#090b10] bg-[#ff2d68]/15 text-[#ff6f96]">
                  <Heart className="h-3.5 w-3.5" fill="currentColor" strokeWidth={2.2} />
                </span>
                <span className="pr-1">
                  <span className="block text-[11px] font-semibold leading-none text-white/90">Made for something real</span>
                  <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">Genuine · Meaningful · Safe</span>
                </span>
              </div>

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
                    className={`flex items-center gap-3 px-4 py-4 ${index % 2 === 0 ? 'border-r' : ''} ${index < 2 ? 'border-b' : ''} border-white/10`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10 text-[#ff2d68]">
                      {createElement(Icon, { className: 'h-4 w-4' })}
                    </span>
                    <span className="text-sm font-medium text-white/90">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <main className="flex w-full items-start justify-center bg-[#050505] px-4 py-8 sm:px-6 lg:h-screen lg:w-[48%] lg:overflow-y-auto custom-scrollbar lg:px-7 lg:py-10 xl:px-8">
            <div className="my-auto w-full max-w-[720px]">
              <div className="rounded-[28px] border border-white/10 bg-[#0b0d11]/95 p-5 shadow-[0_24px_80px_rgba(255,45,104,0.08)] sm:p-7 lg:p-8">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#ff2d68]/50 bg-[#ff2d68]/10">
                  <Heart className="h-5 w-5 text-[#ff2d68]" fill="currentColor" strokeWidth={2.2} />
                </div>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ff2d68]/30 bg-[#ff2d68]/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff7ea2]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#ff2d68]" />
                  Secure access
                </div>

                <h2 className="mb-2 text-[clamp(2rem,2.7vw,2.8rem)] font-bold leading-tight tracking-[-0.06em] text-white">
                  Welcome Back <span className="text-[#ff2d68]">❤️</span>
                </h2>
                <p className="mb-7 text-[0.96rem] leading-7 text-white/60">
                  Continue your journey to meaningful connections.
                </p>

                {error && (
                  <div className="mb-5 rounded-2xl border border-[#ff2d68]/40 bg-[#ff2d68]/8 px-4 py-3 text-sm text-[#ffb7c8]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`${fieldBaseClass} pl-11 pr-4`}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="mb-2 block text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`${fieldBaseClass} pl-11 pr-12`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-white/65">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-white/20 bg-[#111417] accent-[#ff2d68] focus:ring-[#ff2d68]"
                      />
                      <span>Remember Me</span>
                    </label>
                    <Link to="/contact" className="font-semibold text-[#ff8bb0] transition-colors hover:text-[#ffb7c8]">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff2d68] to-[#ff416c] px-5 py-4 text-base font-bold text-white shadow-[0_16px_36px_rgba(255,45,104,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(255,45,104,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Continue Finding Love <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-medium tracking-[0.16em] text-white/40">
                      <span className="bg-[#0b0d11] px-3">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium text-white/75 transition-colors hover:bg-white/[0.07]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium text-white/75 transition-colors hover:bg-white/[0.07]"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Apple
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-sm text-white/65">
                  New here?{' '}
                  <Link to="/signup" className="font-bold text-[#ff5f89] hover:text-[#ff8bb0]">
                    Create your account →
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
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Login;
