const Call = require('../models/Call');

// ══════════════════════════════════════════════════════════════════════════════
// WEBRTC SIGNALING HANDLER - PRODUCTION READY
// ══════════════════════════════════════════════════════════════════════════════

// Store active connections
const activeUsers = new Map(); // userId -> socketId
const activeCalls = new Map(); // callId -> { caller, receiver, status }

function setupCallSignaling(io) {
  
  io.on('connection', (socket) => {
    console.log(`[Video Call] User connected: ${socket.id}`);
    
    // ── User Online ─────────────────────────────────────────────────────────────
    socket.on('user:online', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`[Video Call] User ${userId} is online`);
    });

    // ── Call: Initiate ──────────────────────────────────────────────────────────
    socket.on('call:initiate', async (data) => {
      try {
        const { callId, receiverId, callerInfo } = data;
        
        const receiverSocketId = activeUsers.get(receiverId);
        
        if (!receiverSocketId) {
          socket.emit('call:receiver-offline', { callId });
          return;
        }

        // Store call info
        activeCalls.set(callId, {
          caller: socket.id,
          receiver: receiverSocketId,
          status: 'ringing',
          callerId: socket.userId,
          receiverId: receiverId
        });

        // Update call status in DB
        await Call.findByIdAndUpdate(callId, { status: 'ringing' });

        // Send incoming call to receiver
        io.to(receiverSocketId).emit('call:incoming', {
          callId,
          callType: data.callType || 'video',
          caller: callerInfo
        });

        console.log(`[Video Call] Initiated call ${callId} to ${receiverId}`);

      } catch (error) {
        console.error('[Video Call] Initiate error:', error);
        socket.emit('call:error', { message: 'Failed to initiate call' });
      }
    });

    // ── Call: Accept ────────────────────────────────────────────────────────────
    socket.on('call:accept', async (data) => {
      try {
        const { callId } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }

        callInfo.status = 'accepted';
        activeCalls.set(callId, callInfo);

        // Notify caller that call was accepted
        io.to(callInfo.caller).emit('call:accepted', { callId });

        console.log(`[Video Call] Call ${callId} accepted`);

      } catch (error) {
        console.error('[Video Call] Accept error:', error);
        socket.emit('call:error', { message: 'Failed to accept call' });
      }
    });

    // ── Call: Reject ────────────────────────────────────────────────────────────
    socket.on('call:reject', async (data) => {
      try {
        const { callId } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Notify caller that call was rejected
        io.to(callInfo.caller).emit('call:rejected', { callId });

        // Clean up
        activeCalls.delete(callId);

        console.log(`[Video Call] Call ${callId} rejected`);

      } catch (error) {
        console.error('[Video Call] Reject error:', error);
      }
    });

    // ── Call: Cancel ────────────────────────────────────────────────────────────
    socket.on('call:cancel', async (data) => {
      try {
        const { callId } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Notify receiver that call was cancelled
        io.to(callInfo.receiver).emit('call:cancelled', { callId });

        // Clean up
        activeCalls.delete(callId);

        console.log(`[Video Call] Call ${callId} cancelled`);

      } catch (error) {
        console.error('[Video Call] Cancel error:', error);
      }
    });

    // ── Call: End ───────────────────────────────────────────────────────────────
    socket.on('call:end', async (data) => {
      try {
        const { callId } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Notify both parties
        io.to(callInfo.caller).emit('call:ended', { callId });
        io.to(callInfo.receiver).emit('call:ended', { callId });

        // Clean up
        activeCalls.delete(callId);

        console.log(`[Video Call] Call ${callId} ended`);

      } catch (error) {
        console.error('[Video Call] End error:', error);
      }
    });

    // ── WebRTC: Offer ───────────────────────────────────────────────────────────
    socket.on('webrtc:offer', (data) => {
      try {
        const { callId, offer } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }

        // Forward offer to receiver
        io.to(callInfo.receiver).emit('webrtc:offer', {
          callId,
          offer
        });

        console.log(`[WebRTC] Offer sent for call ${callId}`);

      } catch (error) {
        console.error('[WebRTC] Offer error:', error);
      }
    });

    // ── WebRTC: Answer ──────────────────────────────────────────────────────────
    socket.on('webrtc:answer', (data) => {
      try {
        const { callId, answer } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }

        // Forward answer to caller
        io.to(callInfo.caller).emit('webrtc:answer', {
          callId,
          answer
        });

        console.log(`[WebRTC] Answer sent for call ${callId}`);

      } catch (error) {
        console.error('[WebRTC] Answer error:', error);
      }
    });

    // ── WebRTC: ICE Candidate ───────────────────────────────────────────────────
    socket.on('webrtc:ice-candidate', (data) => {
      try {
        const { callId, candidate } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Determine target (send to the other party)
        const target = socket.id === callInfo.caller 
          ? callInfo.receiver 
          : callInfo.caller;

        // Forward ICE candidate
        io.to(target).emit('webrtc:ice-candidate', {
          callId,
          candidate
        });

      } catch (error) {
        console.error('[WebRTC] ICE candidate error:', error);
      }
    });

    // ── Call: Connection Status ────────────────────────────────────────────────
    socket.on('call:connection-status', (data) => {
      try {
        const { callId, status } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Notify the other party
        const target = socket.id === callInfo.caller 
          ? callInfo.receiver 
          : callInfo.caller;

        io.to(target).emit('call:peer-connection-status', {
          callId,
          status
        });

      } catch (error) {
        console.error('[Video Call] Connection status error:', error);
      }
    });

    // ── Call: Network Quality ───────────────────────────────────────────────────
    socket.on('call:network-quality', (data) => {
      try {
        const { callId, quality } = data;
        const callInfo = activeCalls.get(callId);

        if (!callInfo) {
          return;
        }

        // Notify the other party
        const target = socket.id === callInfo.caller 
          ? callInfo.receiver 
          : callInfo.caller;

        io.to(target).emit('call:peer-network-quality', {
          callId,
          quality
        });

      } catch (error) {
        console.error('[Video Call] Network quality error:', error);
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      try {
        console.log(`[Video Call] User disconnected: ${socket.id}`);

        // Remove from active users
        if (socket.userId) {
          activeUsers.delete(socket.userId);
        }

        // Handle ongoing calls
        activeCalls.forEach((callInfo, callId) => {
          if (callInfo.caller === socket.id || callInfo.receiver === socket.id) {
            // Notify the other party
            const target = socket.id === callInfo.caller 
              ? callInfo.receiver 
              : callInfo.caller;
            
            io.to(target).emit('call:peer-disconnected', { callId });
            
            // Clean up
            activeCalls.delete(callId);
          }
        });

      } catch (error) {
        console.error('[Video Call] Disconnect error:', error);
      }
    });

  });

  // Cleanup inactive calls every 5 minutes
  setInterval(() => {
    const now = Date.now();
    activeCalls.forEach((callInfo, callId) => {
      // Remove calls older than 10 minutes
      if (!callInfo.timestamp || now - callInfo.timestamp > 10 * 60 * 1000) {
        activeCalls.delete(callId);
        console.log(`[Video Call] Cleaned up stale call ${callId}`);
      }
    });
  }, 5 * 60 * 1000);

}

module.exports = { setupCallSignaling, activeUsers, activeCalls };
