import React from 'react';
import { Heart, X, Star } from 'lucide-react';

export default function MobileActions({ onPass, onLike, onSuperLike }) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-6 pointer-events-auto">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <button onClick={onPass} className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 border border-red-100"> <X size={28} /></button>
        <button onClick={onLike} className="w-20 h-20 rounded-full bg-linear-to-r from-primary-600 to-pink-500 shadow-lg flex items-center justify-center text-white transform -translate-y-2"> <Heart size={34} /></button>
        <button onClick={onSuperLike} className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 border border-slate-100"> <Star size={26} /></button>
      </div>
    </div>
  );
}
