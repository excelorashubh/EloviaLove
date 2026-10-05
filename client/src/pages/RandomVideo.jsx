import { ArrowLeft, Coins, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import RandomVideoMatchPanel from '../components/randommatch/RandomVideoMatchPanel';
import { useAuth } from '../context/AuthContext';

const RandomVideoPage = () => {
  const { user } = useAuth();

  const freeCards = user?.randomMatchCards ?? 20;
  const coinBalance = typeof user?.coins === 'number' ? user.coins : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.4)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-pink-200/80">Connect live</p>
                <h1 className="mt-1 text-2xl font-black text-white">Random Video</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-100">
                <Coins size={14} className="text-amber-300" />
                {coinBalance} Coins
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
                <Sparkles size={14} className="text-pink-300" />
                {freeCards} Free Cards
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[32px] border border-pink-500/20 bg-[radial-gradient(circle_at_top,_rgba(253,90,122,0.22),_transparent_30%),linear-gradient(135deg,#111827_0%,#0f172a_40%,#1f2937_100%)] p-6 shadow-[0_28px_90px_rgba(253,90,122,0.18)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-pink-200">
                <Video size={12} />
                Premium Match Experience
              </div>

              <h2 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Meet someone new.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Discover genuine connections through spontaneous one-to-one video calls, designed to feel safe, private, and meaningful.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('random-video-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FD5A7A] to-[#FD2B6B] px-6 py-3 text-sm font-bold text-white shadow-[0_20px_40px_rgba(253,90,122,0.3)] transition hover:-translate-y-0.5"
                >
                  Start Random Video
                </button>
                <Link
                  to="/discover"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Explore profiles
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-200">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm text-slate-300">20 free cards remaining</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
                  <Video size={18} />
                </div>
                <p className="text-sm text-slate-300">2 minutes per free call</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-sm text-slate-300">Safe • private • genuine</p>
              </div>
            </div>
          </div>
        </div>

        <div id="random-video-panel" className="pb-10">
          <RandomVideoMatchPanel />
        </div>
      </div>
    </div>
  );
};

export default RandomVideoPage;
