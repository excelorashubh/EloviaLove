import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, X as XIcon, MoreHorizontal } from 'lucide-react';

export default function ProfileCard({ user = {}, onLike, onPass, onSuperLike, onBookmark, onReport, bookmarked }) {
  const { name = 'Anonymous', age = 25, city = 'Unknown', occupation = '', match = 0, profilePhoto = '', interests = [] } = user;
  return (
    <motion.article whileHover={{ y: -6 }} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
      <div className="relative h-64 bg-slate-100">
        <img src={profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7EB3&color=fff&size=512`} alt={name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-white/70 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">{name} ✓</span>
        </div>
        <div className="absolute top-3 right-3">
          <button className="bg-white/70 p-2 rounded-full shadow-sm"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">{name} <span className="text-sm text-slate-500">{age}</span></div>
            <div className="text-sm text-slate-500">{city} • {occupation}</div>
          </div>
          <div className="text-sm font-bold text-pink-500">{match}%</div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {interests.slice(0,5).map((t) => (
            <span key={t} className="text-xs bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-600">{t}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={onPass} className="flex-1 rounded-2xl border border-red-200 text-red-600 px-3 py-2 flex items-center justify-center gap-2 hover:scale-105 transition"> <XIcon size={16} /> Pass</button>
          <button onClick={onLike} className="rounded-full bg-linear-to-r from-primary-600 to-pink-500 text-white p-3 shadow-md hover:scale-105 transition"> <Heart size={18} /></button>
          <button onClick={onSuperLike} className="flex-1 rounded-2xl border border-slate-200 text-slate-700 px-3 py-2 hover:scale-105 transition"> <Star size={16} /> Super</button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => onBookmark && onBookmark(user._id)} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'} className={`px-3 py-2 rounded-xl text-sm ${bookmarked ? 'bg-primary-50 text-primary-700' : 'bg-slate-50 text-slate-600'}`}>
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => onReport && onReport(user._id)} aria-label="Report user" className="px-3 py-2 rounded-xl text-sm bg-red-50 text-red-600">Report</button>
          </div>
          {user.reported && (
            <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">Reported</div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
