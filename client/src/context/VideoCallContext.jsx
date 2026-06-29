import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  
  // Call states
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  
  // WebRTC refs
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  
  // Media states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  
  // Connection states
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Call history
  const [missedCallsCount, setMissedCallsCount] = useState(0);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: { token: localStorage.getItem('token') }
      });

      newSocket.on('connect', () => {
        console.log('[VideoCall] Socket connected');
        newSocket.emit('user:online', user._id);
      });

      newSocket.on('call:incoming', handleIncomingCall);
      newSocket.on('call:accepted', handleCallAccepted);
      newSocket.on('call:rejected', handleCallRejected);
      newSocket.on('call:cancelled', handleCallCancelled);
      newSocket.on('call:ended', handleCallEnded);
      newSocket.on('call:receiver-offline', handleReceiverOffline);
      newSocket.on('webrtc:offer', handleOffer);
      newSocket.on('webrtc:answer', handleAnswer);
      newSocket.on('webrtc:ice-candidate', handleIceCandidate);
      newSocket.on('call:peer-disconnected', handlePeerDisconnected);

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Fetch missed calls count
  useEffect(() => {
    if (isAuthenticated) {
      fetchMissedCallsCount();
    }
  }, [isAuthenticated]);

  const fetchMissedCallsCount = async () => {
    try {
      const response = await api.get('/calls/missed-count');
      if (response.data.success) {
        setMissedCallsCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch missed calls count:', error);
    }
  };

  // Handle incoming call
  const handleIncomingCall = (data) => {
    console.log('[VideoCall] Incoming call:', data);
    setIncomingCall(data);
    setCallStatus('ringing');
    
    // Play ringtone (implement audio)
    playRingtone();
  };

  // Initialize call
  const initiateCall = async (receiverId, receiverInfo, callType = 'video') => {
    try {
      setCallStatus('calling');
      
      // Create call in database
      const response = await api.post('/calls/initiate', {
        receiverId,
        callType
      });

      const call = response.data.call;
      setActiveCall(call);

      // Emit socket event
      socket?.emit('call:initiate', {
        callId: call._id,
        receiverId,
        callType,
        callerInfo: {
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        }
      });

      // Set timeout for no answer
      setTimeout(() => {
        if (callStatus === 'calling') {
          cancelCall(call._id);
        }
      }, 30000); // 30 seconds

      return call;
    } catch (error) {
      console.error('[VideoCall] Failed to initiate call:', error);
      setCallStatus('idle');
      throw error;
    }
  };

  // Accept call
  const acceptCall = async () => {
    try {
      if (!incomingCall) return;

      stopRingtone();
      
      // Update call in database
      const response = await api.post(`/calls/accept/${incomingCall.callId}`);

      if (response.data.success) {
        setActiveCall(response.data.call);
        setCallStatus('connected');
        
        // Emit socket event
        socket?.emit('call:accept', {
          callId: incomingCall.callId
        });

        // Initialize WebRTC as receiver
        await initializeWebRTC(false);
        
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('[VideoCall] Failed to accept call:', error);
    }
  };

  // Reject call
  const rejectCall = async () => {
    try {
      if (!incomingCall) return;

      stopRingtone();

      // Update call in database
      await api.post(`/calls/reject/${incomingCall.callId}`);

      // Emit socket event
      socket?.emit('call:reject', {
        callId: incomingCall.callId
      });

      setIncomingCall(null);
      setCallStatus('idle');
    } catch (error) {
      console.error('[VideoCall] Failed to reject call:', error);
    }
  };

  // Cancel call
  const cancelCall = async (callId) => {
    try {
      // Update call in database
      await api.post(`/calls/cancel/${callId || activeCall?._id}`);

      // Emit socket event
      socket?.emit('call:cancel', {
        callId: callId || activeCall?._id
      });

      cleanup();
    } catch (error) {
      console.error('[VideoCall] Failed to cancel call:', error);
    }
  };

  // End call
  const endCall = async (quality = 'good') => {
    try {
      if (!activeCall) return;

      // Update call in database
      await api.post(`/calls/end/${activeCall._id}`, {
        quality,
        reason: 'completed'
      });

      // Emit socket event
      socket?.emit('call:end', {
        callId: activeCall._id
      });

      cleanup();
    } catch (error) {
      console.error('[VideoCall] Failed to end call:', error);
      cleanup();
    }
  };

  // Initialize WebRTC
  const initializeWebRTC = async (isCaller) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStream.current = stream;

      // Create peer connection
      peerConnection.current = new RTCPeerConnection(iceServers);

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      // Handle remote stream
      remoteStream.current = new MediaStream();
      peerConnection.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.current.addTrack(track);
        });
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('webrtc:ice-candidate', {
            callId: activeCall._id,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current.connectionState;
        console.log('[WebRTC] Connection state:', state);
        
        if (state === 'connected') {
          setCallStatus('connected');
          setIsReconnecting(false);
        } else if (state === 'disconnected' || state === 'failed') {
          setIsReconnecting(true);
        } else if (state === 'closed') {
          cleanup();
        }
      };

      // If caller, create offer
      if (isCaller) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        socket?.emit('webrtc:offer', {
          callId: activeCall._id,
          offer
        });
      }

    } catch (error) {
      console.error('[WebRTC] Initialization error:', error);
      throw error;
    }
  };

  // Handle WebRTC offer
  const handleOffer = async ({ callId, offer }) => {
    try {
      if (!peerConnection.current) {
        await initializeWebRTC(false);
      }

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      socket?.emit('webrtc:answer', {
        callId,
        answer
      });
    } catch (error) {
      console.error('[WebRTC] Handle offer error:', error);
    }
  };

  // Handle WebRTC answer
  const handleAnswer = async ({ callId, answer }) => {
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('[WebRTC] Handle answer error:', error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async ({ callId, candidate }) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('[WebRTC] Handle ICE candidate error:', error);
    }
  };

  // Handle call accepted
  const handleCallAccepted = async ({ callId }) => {
    console.log('[VideoCall] Call accepted');
    setCallStatus('connected');
    await initializeWebRTC(true);
  };

  // Handle call rejected
  const handleCallRejected = ({ callId }) => {
    console.log('[VideoCall] Call rejected');
    cleanup();
  };

  // Handle call cancelled
  const handleCallCancelled = ({ callId }) => {
    console.log('[VideoCall] Call cancelled');
    stopRingtone();
    setIncomingCall(null);
    setCallStatus('idle');
  };

  // Handle call ended
  const handleCallEnded = ({ callId }) => {
    console.log('[VideoCall] Call ended');
    cleanup();
  };

  // Handle receiver offline
  const handleReceiverOffline = ({ callId }) => {
    console.log('[VideoCall] Receiver offline');
    cleanup();
  };

  // Handle peer disconnected
  const handlePeerDisconnected = ({ callId }) => {
    console.log('[VideoCall] Peer disconnected');
    cleanup();
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Cleanup
  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    remoteStream.current = null;
    setActiveCall(null);
    setCallStatus('idle');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsReconnecting(false);
  };

  // Ringtone helpers (to be implemented with audio)
  const playRingtone = () => {
    // Implement ringtone audio
    console.log('[VideoCall] Playing ringtone');
  };

  const stopRingtone = () => {
    // Stop ringtone audio
    console.log('[VideoCall] Stopping ringtone');
  };

  const value = {
    // States
    incomingCall,
    activeCall,
    callStatus,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerEnabled,
    connectionQuality,
    isReconnecting,
    missedCallsCount,
    
    // Streams
    localStream: localStream.current,
    remoteStream: remoteStream.current,
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleVideo,
    toggleAudio,
    
    // Utilities
    fetchMissedCallsCount
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
