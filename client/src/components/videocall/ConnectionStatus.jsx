import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, WifiOff } from 'lucide-react';

const ConnectionStatus = ({ status = 'connecting' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <Loader2 size={32} className="animate-spin" />,
          text: 'Connecting...',
          color: 'text-blue-400',
        };
      case 'reconnecting':
        return {
          icon: <Loader2 size={32} className="animate-spin" />,
          text: 'Reconnecting...',
          color: 'text-yellow-400',
        };
      case 'failed':
        return {
          icon: <WifiOff size={32} />,
          text: 'Connection failed',
          color: 'text-red-400',
        };
      default:
        return {
          icon: <Loader2 size={32} className="animate-spin" />,
          text: 'Please wait...',
          color: 'text-slate-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className={config.color}>{config.icon}</div>
      <p className="text-white text-lg font-semibold">{config.text}</p>
    </motion.div>
  );
};

export default ConnectionStatus;
