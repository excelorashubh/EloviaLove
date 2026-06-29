import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from '../ui/VerifiedBadge';

const IncomingCallModal = ({ caller, onAccept, onReject }) => {
  const ringtoneRef = useRef(null);

  useEffect(() => {
    // Play ringtone (you can add actual audio file later)
    // const audio = new Audio('/ringtone.mp3');
    // audio.loop = true;
    // audio.play();
    // ringtoneRef.current = audio;

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  if (!caller) return null;

  const callerAvatar = caller.profilePicture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(caller.name || 'User')}&background=e879a0&color=fff&size=200`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        >
          {/* Pulsing animation background */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Caller Photo */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative mx-auto w-32 h-32 mb-6"
            >
              <img
                src={callerAvatar}
                alt={caller.name}
                className="w-full h-full rounded-full object-cover border-4 border-white/30 shadow-xl"
              />
              {caller.isVerified && (
                <div className="absolute bottom-2 right-2">
                  <VerifiedBadge size={24} />
                </div>
              )}
            </motion.div>

            {/* Caller Name */}
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              {caller.name}
            </h2>

            {/* Call Type */}
            <p className="text-white/80 text-sm mb-8">Incoming Video Call...</p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6">
              {/* Reject Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReject}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/50 transition-colors">
                  <X size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white/80 text-xs font-medium">Decline</span>
              </motion.button>

              {/* Accept Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAccept}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/50 transition-all">
                  <Phone size={32} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white text-sm font-semibold">Accept</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;
