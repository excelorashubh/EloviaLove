import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import CallControls from './CallControls';
import CallTimer from './CallTimer';
import NetworkQualityIndicator from './NetworkQualityIndicator';
import ConnectionStatus from './ConnectionStatus';

const VideoCallScreen = ({
  localStream,
  remoteStream,
  callStatus,
  isVideoEnabled,
  isAudioEnabled,
  connectionQuality,
  isReconnecting,
  otherUser,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  callStartTime,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const otherUserAvatar = otherUser?.profilePicture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=e879a0&color=fff&size=400`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900">
      {/* Remote Video (Large) */}
      <div className="relative w-full h-full">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <img
                src={otherUserAvatar}
                alt={otherUser?.name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
              />
              <p className="text-white text-lg font-semibold">{otherUser?.name}</p>
              <p className="text-white/60 text-sm mt-2">
                {callStatus === 'ringing' ? 'Ringing...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}

        {/* Connection Status Overlay */}
        {isReconnecting && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <ConnectionStatus status="reconnecting" />
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-white font-semibold">{otherUser?.name}</p>
                <CallTimer startTime={callStartTime} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NetworkQualityIndicator quality={connectionQuality} />
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Local Video (PiP - Picture in Picture) */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            top: 20,
            left: 20,
            right: window.innerWidth - 180,
            bottom: window.innerHeight - 260,
          }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            setPipPosition({ x: info.point.x, y: info.point.y });
          }}
          initial={{ x: 20, y: 20 }}
          className="absolute top-20 right-6 w-40 h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 cursor-move"
          style={{ touchAction: 'none' }}
        >
          {isVideoEnabled && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {otherUser?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <CallControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={onToggleVideo}
            onToggleAudio={onToggleAudio}
            onEndCall={onEndCall}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCallScreen;
