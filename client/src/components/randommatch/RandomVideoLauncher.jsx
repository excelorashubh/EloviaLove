import { ArrowRight, Coins, Sparkles, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const RandomVideoLauncher = ({ compact = false }) => {
  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${compact ? 'p-5' : 'p-6'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,90,122,0.12),_transparent_40%)]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FD5A7A] to-[#FD2B6B] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-lg shadow-pink-500/20">
              <Video size={12} />
              Random Video
            </div>
            <h3 className="mt-3 text-2xl font-black text-slate-900">Meet someone genuine, instantly</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <Coins size={16} className="text-amber-500" />
            0 coins
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enjoy secure, one-to-one video chats with verified people in a premium, distraction-free experience.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Free cards</p>
            <p className="mt-1 text-lg font-bold text-slate-900">20</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Duration</p>
            <p className="mt-1 text-lg font-bold text-slate-900">2 min</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">After free cards</p>
            <p className="mt-1 text-lg font-bold text-slate-900">100 coins/min</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <Sparkles size={14} className="text-pink-500" />
            Safe • Private • Genuine
          </div>

          <Link
            to="/random-video"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FD5A7A] to-[#FD2B6B] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(253,90,122,0.25)] transition hover:-translate-y-0.5"
          >
            Start random video
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RandomVideoLauncher;
