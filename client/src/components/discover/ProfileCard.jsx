import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, X as XIcon, MoreHorizontal, CheckCircle2, MapPin } from 'lucide-react';

export default function ProfileCard({ user = {}, onLike, onPass, onSuperLike, onBookmark, onReport, bookmarked }) {
  const {
    name = 'Anonymous',
    age = 25,
    location = 'Unknown',
    occupation = 'Not specified',
    match = 0,
    profilePhoto = '',
    interests = [],
    bio = '',
    religion = '',
    height = '',
    isVerified = false,
  } = user;
  const avatar = profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7e5bef&color=fff&size=512`;

  return (
    <motion.article whileHover={{ y: -8 }} transition={{ duration: 0.25 }} className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
      <div className="relative overflow-hidden rounded-[32px] bg-slate-100">
        <img
          src={avatar}
          alt={name}
          className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLike && onLike(user._id)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md transition hover:scale-105"
          >
            <Heart size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition hover:scale-105"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                {name}, {age}
                {isVerified && <CheckCircle2 size={18} className="text-cyan-300" />}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                <MapPin size={14} /> {location}
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">
              {match}% Match
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Occupation</p>
            <p className="mt-2 font-semibold">{occupation}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Details</p>
            <p className="mt-2 font-semibold">{religion || 'Open'} · {height ? `${height}cm` : 'Height N/A'}</p>
          </div>
        </div>

        {bio && <p className="text-sm leading-6 text-slate-600 line-clamp-3">{bio}</p>}

        {interests?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.slice(0, 5).map((interest) => (
              <span key={interest} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {interest}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onPass && onPass(user._id)}
            className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5"
          >
            <XIcon size={16} /> Pass
          </button>
          <button
            type="button"
            onClick={() => onSuperLike && onSuperLike(user._id)}
            className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5"
          >
            <Star size={16} /> Super
          </button>
          <button
            type="button"
            onClick={() => onLike && onLike(user._id)}
            className="rounded-3xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 px-4 py-3 text-white text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
          >
            ❤️ Like
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onBookmark && onBookmark(user._id)}
            className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${bookmarked ? 'bg-violet-50 text-violet-700 border border-violet-100' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            {bookmarked ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onReport && onReport(user._id)}
            className="rounded-3xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 border border-red-100 transition hover:bg-red-100"
          >
            Report
          </button>
        </div>
      </div>
    </motion.article>
  );
}
