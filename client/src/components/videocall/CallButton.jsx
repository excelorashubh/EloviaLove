import React, { useState, useEffect } from 'react';
import { Video, Loader2, Lock, UserX, ShieldAlert, Ban, Clock } from 'lucide-react';
import { useVideoCall } from '../../context/VideoCallContext';
import { useAuth } from '../../context/AuthContext';
import CallConfirmationModal from './CallConfirmationModal';
import api from '../../services/api';

const CallButton = ({ 
  userId, 
  userInfo, 
  variant = 'icon',
  label = 'Video Call',
  onCallStart,
  showTooltip = true
}) => {
  const { initiateCall } = useVideoCall();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [permission, setPermission] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check if call is allowed
  useEffect(() => {
    const checkPermission = async () => {
      if (!userId || userId === user?.id || userId === user?._id) {
        setChecking(false);
        return;
      }

      try {
        setChecking(true);
        const response = await api.get(`/calls/can-call/${userId}`);
        setPermission(response.data);
      } catch (err) {
        console.error('Failed to check call permission:', err);
        setPermission({
          canCall: false,
          reason: 'Unable to verify call permission',
          icon: 'error'
        });
      } finally {
        setChecking(false);
      }
    };

    checkPermission();
  }, [userId, user]);

  const handleCall = async () => {
    if (loading || !permission?.canCall) return;

    // Show confirmation modal for primary/secondary variants
    if (variant === 'primary' || variant === 'secondary') {
      setShowConfirmation(true);
      return;
    }

    // Direct call for icon variant
    await initiateVideoCall();
  };

  const initiateVideoCall = async () => {
    try {
      setLoading(true);
      setShowConfirmation(false);

      // Initiate call
      await initiateCall(userId, userInfo, 'video');
      
      if (onCallStart) {
        onCallStart();
      }
    } catch (err) {
      console.error('Failed to initiate call:', err);
      alert(err.message || 'Failed to start call');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking permissions
  if (checking) {
    if (variant === 'icon') {
      return (
        <button
          disabled
          className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 cursor-wait"
        >
          <Loader2 size={18} className="animate-spin" />
        </button>
      );
    }
    return null;
  }

  // Don't show if permissions check failed and no permission data
  if (!permission) return null;

  // Get icon based on reason
  const getIcon = () => {
    if (loading) return <Loader2 size={18} className="animate-spin" />;
    
    if (!permission.canCall) {
      switch (permission.icon) {
        case 'lock': return <Lock size={18} />;
        case 'block': return <UserX size={18} />;
        case 'ban': return <Ban size={18} />;
        case 'clock': return <Clock size={18} />;
        case 'shield': return <ShieldAlert size={18} />;
        default: return <Video size={18} />;
      }
    }
    
    return <Video size={18} />;
  };

  // Icon variant (for header - always shown but disabled if can't call)
  if (variant === 'icon') {
    if (!permission.canCall) {
      return (
        <div className="relative group">
          <button
            disabled
            className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 cursor-not-allowed"
            title={permission.reason}
          >
            {getIcon()}
          </button>
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 max-w-xs">
              {permission.reason}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={handleCall}
        disabled={loading}
        className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Start video call"
      >
        {getIcon()}
      </button>
    );
  }

  // Hidden variant - don't show button if can't call
  if (variant === 'hidden' && !permission.canCall) {
    return null;
  }

  // Primary button variant (for profile cards and discover)
  if (variant === 'primary') {
    if (!permission.canCall) {
      return (
        <div className="w-full">
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
          >
            {getIcon()}
            <span className="text-sm">{permission.shortReason || 'Unavailable'}</span>
          </button>
          <p className="text-xs text-slate-500 mt-1.5 text-center">{permission.reason}</p>
        </div>
      );
    }

    return (
      <button
        onClick={handleCall}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {getIcon()}
        <span>{loading ? 'Calling...' : label}</span>
      </button>
    );
  }

  // Secondary/compact variant
  if (!permission.canCall) {
    return (
      <div className="relative group">
        <button
          disabled
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed"
        >
          {getIcon()}
          <span className="hidden sm:inline">{permission.shortReason || 'Unavailable'}</span>
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 max-w-xs">
            {permission.reason}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleCall}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {getIcon()}
        <span className="hidden sm:inline">{loading ? 'Calling...' : label}</span>
      </button>

      {/* Confirmation Modal */}
      <CallConfirmationModal
        user={userInfo}
        isOpen={showConfirmation}
        onConfirm={initiateVideoCall}
        onCancel={() => setShowConfirmation(false)}
      />
    </>
  );
};

export default CallButton;
