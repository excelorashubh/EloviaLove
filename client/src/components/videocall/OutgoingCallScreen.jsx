import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import VerifiedBadge from '../ui/VerifiedBadge';

const OutgoingCallScreen = ({ receiver, onCancel }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const receiverAvatar = receiver?.profilePicture || receiver?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver?.name || 'User')}&background=e879a0&color=fff&size=400`;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-full flex flex-col items-center justify-center px-4">
        {/* Pulsing rings animation */}
        <div className="relative mb-8">
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-full border-4 border-green-400/30"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: ring * 0.4,
                ease: 'easeOut',
              }}
              style={{
                width: '160px',
                height: '160px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Receiver photo */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10"
          >
            <img
              src={receiverAvatar}
              alt={receiver?.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl"
            />
            {receiver?.isVerified && (
              <div className="absolute bottom-2 right-2">
                <VerifiedBadge size={28} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Receiver name */}
        <h2 className="text-3xl font-bold text-white mb-2">{receiver?.name}</h2>

        {/* Calling status */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg text-white/80 mb-8"
        >
          Calling{dots}
        </motion.p>

        {/* Info text */}
        <p className="text-sm text-white/60 mb-12 text-center max-w-xs">
          Waiting for {receiver?.name?.split(' ')[0]} to accept
        </p>

        {/* Cancel button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl shadow-red-500/50 transition-colors">
            <X size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white/80 text-sm font-medium">Cancel</span>
        </motion.button>
      </div>
    </div>
  );
};

export default OutgoingCallScreen;
