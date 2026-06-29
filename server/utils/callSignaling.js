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

        // Store call info with timestamp
        activeCalls.set(callId, {
          caller: socket.id,
          receiver: receiverSocketId,
          status: 'ringing',
          callerId: socket.userId,
          receiverId: receiverId,
          timestamp: Date.now()
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
    socket.on('disconnect', async () => {
      try {
        console.log(`[Video Call] User disconnected: ${socket.id}`);

        const disconnectedUserId = socket.userId;

        // Remove from active users
        if (disconnectedUserId) {
          activeUsers.delete(disconnectedUserId);
          console.log(`[Video Call] User ${disconnectedUserId} marked offline`);
        }

        // Handle ongoing calls - both in-memory and database
        const callsToCleanup = [];
        activeCalls.forEach((callInfo, callId) => {
          if (callInfo.caller === socket.id || callInfo.receiver === socket.id) {
            callsToCleanup.push({ callId, callInfo });
            
            // Notify the other party
            const target = socket.id === callInfo.caller 
              ? callInfo.receiver 
              : callInfo.caller;
            
            io.to(target).emit('call:peer-disconnected', { callId });
            
            // Clean up in-memory
            activeCalls.delete(callId);
          }
        });

        // Update database for all affected calls
        if (callsToCleanup.length > 0) {
          console.log(`[Video Call] Cleaning up ${callsToCleanup.length} calls for disconnected user`);
          
          for (const { callId, callInfo } of callsToCleanup) {
            try {
              const call = await Call.findById(callId);
              if (call && ['initiated', 'ringing', 'accepted'].includes(call.status)) {
                // If call was accepted (in progress), mark as completed
                // Otherwise mark as cancelled/missed
                if (call.status === 'accepted') {
                  call.status = 'completed';
                  call.endReason = 'network_error';
                  call.endedAt = new Date();
                  call.calculateDuration();
                } else if (call.status === 'ringing') {
                  call.status = 'missed';
                  call.endReason = 'missed';
                  call.endedAt = new Date();
                } else {
                  call.status = 'cancelled';
                  call.endReason = 'network_error';
                  call.endedAt = new Date();
                }
                await call.save();
                console.log(`[Video Call] Call ${callId} cleaned up on disconnect (status: ${call.status})`);
              }
            } catch (dbError) {
              console.error(`[Video Call] Failed to cleanup call ${callId} in DB:`, dbError);
            }
          }
        }

        // Also cleanup any orphaned calls in DB for this user
        if (disconnectedUserId) {
          try {
            const orphanedCalls = await Call.find({
              $or: [
                { callerId: disconnectedUserId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
                { receiverId: disconnectedUserId, status: { $in: ['initiated', 'ringing', 'accepted'] } }
              ]
            });

            if (orphanedCalls.length > 0) {
              console.log(`[Video Call] Found ${orphanedCalls.length} orphaned calls for user ${disconnectedUserId}`);
              
              for (const call of orphanedCalls) {
                if (call.status === 'accepted') {
                  call.status = 'completed';
                  call.endReason = 'network_error';
                } else if (call.status === 'ringing' && call.receiverId.toString() === disconnectedUserId) {
                  call.status = 'missed';
                  call.endReason = 'missed';
                } else {
                  call.status = 'cancelled';
                  call.endReason = 'network_error';
                }
                call.endedAt = new Date();
                if (call.status === 'completed') {
                  call.calculateDuration();
                }
                await call.save();
                console.log(`[Video Call] Orphaned call ${call._id} cleaned up (status: ${call.status})`);
              }
            }
          } catch (dbError) {
            console.error(`[Video Call] Failed to cleanup orphaned calls:`, dbError);
          }
        }

      } catch (error) {
        console.error('[Video Call] Disconnect error:', error);
      }
    });

  });

  // Cleanup stale calls in database every 2 minutes
  setInterval(async () => {
    try {
      const now = new Date();
      const staleThreshold = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
      
      // Find calls that are stuck in active states
      const staleCalls = await Call.find({
        status: { $in: ['initiated', 'ringing'] },
        createdAt: { $lt: staleThreshold }
      });

      if (staleCalls.length > 0) {
        console.log(`[Video Call] Found ${staleCalls.length} stale calls to cleanup`);
        
        for (const call of staleCalls) {
          // Timeout: initiated/ringing calls older than 2 minutes
          if (call.status === 'ringing') {
            call.status = 'missed';
            call.endReason = 'timeout';
          } else {
            call.status = 'cancelled';
            call.endReason = 'timeout';
          }
          call.endedAt = now;
          await call.save();
          
          console.log(`[Video Call] Stale call ${call._id} cleaned up (was ${call.status}, marked as timeout)`);
          
          // Remove from in-memory if exists
          activeCalls.delete(call._id.toString());
        }
      }

      // Also cleanup accepted calls that are older than 2 hours (likely abandoned)
      const abandonedThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const abandonedCalls = await Call.find({
        status: 'accepted',
        startedAt: { $lt: abandonedThreshold }
      });

      if (abandonedCalls.length > 0) {
        console.log(`[Video Call] Found ${abandonedCalls.length} abandoned accepted calls to cleanup`);
        
        for (const call of abandonedCalls) {
          call.status = 'completed';
          call.endReason = 'timeout';
          call.endedAt = now;
          call.calculateDuration();
          await call.save();
          
          console.log(`[Video Call] Abandoned call ${call._id} cleaned up (duration: ${call.duration}s)`);
          
          // Remove from in-memory if exists
          activeCalls.delete(call._id.toString());
        }
      }

    } catch (error) {
      console.error('[Video Call] Stale call cleanup error:', error);
    }
  }, 2 * 60 * 1000); // Run every 2 minutes

  // Cleanup in-memory activeCalls map every 5 minutes
  setInterval(() => {
    const now = Date.now();
    activeCalls.forEach((callInfo, callId) => {
      // Remove calls older than 10 minutes from memory
      if (!callInfo.timestamp || now - callInfo.timestamp > 10 * 60 * 1000) {
        activeCalls.delete(callId);
        console.log(`[Video Call] Cleaned up stale in-memory call ${callId}`);
      }
    });
  }, 5 * 60 * 1000); // Run every 5 minutes

}

module.exports = { setupCallSignaling, activeUsers, activeCalls };
