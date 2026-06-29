import React, { useState } from 'react';
import { Video, Loader2 } from 'lucide-react';
import { useVideoCall } from '../../context/VideoCallContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CallButton = ({ 
  userId, 
  userInfo, 
  variant = 'icon',
  label = 'Video Call',
  onCallStart 
}) => {
  const { initiateCall } = useVideoCall();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canCall, setCanCall] = useState(null);

  // Check if call is allowed
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await api.get(`/calls/can-call/${userId}`);
        setCanCall(response.data.canCall);
        if (!response.data.canCall) {
          setError(response.data.reason);
        }
      } catch (err) {
        console.error('Failed to check call permission:', err);
        setCanCall(false);
        setError('Unable to verify call permission');
      }
    };

    if (userId && userId !== user?.id && userId !== user?._id) {
      checkPermission();
    }
  }, [userId, user]);

  const handleCall = async () => {
    if (loading || !canCall) return;

    try {
      setLoading(true);
      setError(null);

      // Initiate call
      await initiateCall(userId, userInfo, 'video');
      
      if (onCallStart) {
        onCallStart();
      }
    } catch (err) {
      console.error('Failed to initiate call:', err);
      setError(err.message || 'Failed to start call');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if checking permissions
  if (canCall === null) {
    return null;
  }

  // Don't show if can't call
  if (!canCall) {
    if (variant === 'tooltip') {
      return (
        <div className="relative group">
          <button
            disabled
            className="p-2 rounded-full bg-slate-100 text-slate-400 cursor-not-allowed"
            title={error || 'Video call unavailable'}
          >
            <Video size={18} />
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {error || 'Video call unavailable'}
          </div>
        </div>
      );
    }
    return null;
  }

  // Icon variant (for header)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleCall}
        disabled={loading}
        className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Start video call"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
      </button>
    );
  }

  // Primary button variant (for profile cards)
  if (variant === 'primary') {
    return (
      <button
        onClick={handleCall}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Video size={18} />
        )}
        <span>{label}</span>
      </button>
    );
  }

  // Secondary variant
  return (
    <button
      onClick={handleCall}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Video size={16} />
      )}
      <span>{label}</span>
    </button>
  );
};

export default CallButton;
