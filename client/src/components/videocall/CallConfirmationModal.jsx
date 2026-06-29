import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X } from 'lucide-react';
import VerifiedBadge from '../ui/VerifiedBadge';

const CallConfirmationModal = ({ user, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  const userAvatar = user?.profilePicture || user?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=e879a0&color=fff&size=200`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Start Video Call?</h3>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={userAvatar}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 mb-3"
            />
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
              {user?.isVerified && <VerifiedBadge size={18} />}
            </div>
            {user?.location && (
              <p className="text-sm text-slate-500 mt-1">{user.location}</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
            <p className="text-sm text-blue-900 text-center">
              Make sure you're in a quiet place with good lighting
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Video size={18} />
              Call
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallConfirmationModal;
