import React, { useState, useEffect } from 'react';

const CallTimer = ({ startTime }) => {
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setDuration(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="text-white/80 text-sm font-mono">
      {duration}
    </div>
  );
};

export default CallTimer;
