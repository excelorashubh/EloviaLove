import React from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';

const CallControls = ({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Toggle Video */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleVideo}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isVideoEnabled
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
      </motion.button>

      {/* Toggle Audio */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleAudio}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isAudioEnabled
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
      </motion.button>

      {/* End Call */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEndCall}
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl shadow-red-500/50 transition-colors"
        title="End call"
      >
        <PhoneOff size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

export default CallControls;
