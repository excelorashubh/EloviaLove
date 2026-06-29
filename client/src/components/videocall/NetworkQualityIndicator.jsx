import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkQualityIndicator = ({ quality = 'excellent' }) => {
  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: <Wifi size={16} />,
          color: 'text-green-400',
          bars: 3,
        };
      case 'good':
        return {
          icon: <Wifi size={16} />,
          color: 'text-yellow-400',
          bars: 2,
        };
      case 'fair':
        return {
          icon: <Wifi size={16} />,
          color: 'text-orange-400',
          bars: 1,
        };
      case 'poor':
        return {
          icon: <WifiOff size={16} />,
          color: 'text-red-400',
          bars: 0,
        };
      default:
        return {
          icon: <Wifi size={16} />,
          color: 'text-slate-400',
          bars: 3,
        };
    }
  };

  const config = getQualityConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 ${config.color}`}>
      {config.icon}
      <div className="flex items-end gap-0.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${
              i < config.bars ? 'bg-current' : 'bg-white/20'
            }`}
            style={{ height: `${(i + 1) * 4}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkQualityIndicator;
