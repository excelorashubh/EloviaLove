const express  = require('express');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// In production replace with Twilio / MSG91 / Fast2SMS
const sendOTPviaSMS = async (phone, otp) => {
  // TODO: integrate SMS provider
  console.log(`[OTP] Send to ${phone}: ${otp}`);
  // For dev — OTP is returned in response (remove in production)
  return otp;
};

// ── POST /api/verify/send-otp ─────────────────────────────────────────────────
router.post('/send-otp', protect, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    // Check phone not already used by another account
    const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await User.findByIdAndUpdate(req.user._id, {
      phone,
      otpCode:   otp,
      otpExpiry: expiry,
    });

    const devOtp = await sendOTPviaSMS(phone, otp);

    res.json({
      success: true,
      message: `OTP sent to ${phone}`,
      // Remove devOtp in production:
      ...(process.env.NODE_ENV !== 'production' && { devOtp }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/verify/verify-otp ───────────────────────────────────────────────
router.post('/verify-otp', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

    const user = await User.findById(req.user._id).select('+otpCode +otpExpiry');
    if (!user.otpCode) {
      return res.status(400).json({ success: false, message: 'No OTP requested. Send OTP first.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (user.otpCode !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      phoneVerified: true,
      otpCode:   null,
      otpExpiry: null,
    });

    res.json({ success: true, message: 'Phone verified successfully ✓' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/verify/send-email ───────────────────────────────────────────────
router.post('/send-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email already verified' });
    }

    // Generate a signed token valid for 24h
    const token = jwt.sign(
      { userId: user._id, purpose: 'email-verify' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // TODO: integrate nodemailer / SendGrid
    console.log(`[EMAIL VERIFY] Send to ${user.email}: ${verifyUrl}`);

    res.json({
      success: true,
      message: `Verification email sent to ${user.email}`,
      ...(process.env.NODE_ENV !== 'production' && { devUrl: verifyUrl }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/verify/confirm-email?token=xxx ───────────────────────────────────
router.get('/confirm-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'email-verify') {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    await User.findByIdAndUpdate(decoded.userId, { emailVerified: true });
    res.json({ success: true, message: 'Email verified successfully ✓' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
});

// ── POST /api/verify/request-blue-tick ───────────────────────────────────────
// Premium/Pro only — submit selfie for manual admin review
router.post('/request-blue-tick', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!['premium', 'pro'].includes(user.plan)) {
      return res.status(403).json({ success: false, message: 'Blue tick verification requires Premium or Pro plan' });
    }
    if (user.blueTickStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Verification request already pending' });
    }
    if (user.isVerified) {
      return res.json({ success: true, message: 'Already verified' });
    }

    const { selfieImage, idProof } = req.body;
    if (!selfieImage) {
      return res.status(400).json({ success: false, message: 'Selfie image is required' });
    }

    // Cancel any previous rejected request
    await VerificationRequest.deleteMany({ userId: req.user._id, status: 'rejected' });

    await VerificationRequest.create({
      userId: req.user._id,
      selfieImage,
      idProof: idProof || '',
    });

    await User.findByIdAndUpdate(req.user._id, { blueTickStatus: 'pending' });

    res.json({ success: true, message: 'Verification request submitted. Admin will review within 24–48 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/verify/status ────────────────────────────────────────────────────
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      phoneVerified:  user.phoneVerified,
      emailVerified:  user.emailVerified,
      isVerified:     user.isVerified,
      blueTickStatus: user.blueTickStatus,
      phone:          user.phone,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: GET /api/verify/requests ──────────────────────────────────────────
router.get('/requests', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
    const requests = await VerificationRequest.find({ status: 'pending' })
      .populate('userId', 'name email profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: POST /api/verify/grant/:userId ────────────────────────────────────
// Directly grant or revoke blue tick for any user
router.post('/grant/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });

    const { grant } = req.body; // true = grant, false = revoke
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndUpdate(req.params.userId, {
      isVerified:     !!grant,
      blueTickStatus: grant ? 'approved' : 'none',
    });

    // Notify user via socket
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.userId).emit('notification', {
        type:    'verification',
        title:   grant ? 'Blue Tick Granted ✓' : 'Blue Tick Revoked',
        message: grant
          ? 'An admin has granted you a verified blue tick badge!'
          : 'Your blue tick verification has been revoked by an admin.',
      });
    }

    res.json({ success: true, message: grant ? 'Blue tick granted' : 'Blue tick revoked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: POST /api/verify/review/:requestId ─────────────────────────────────
router.post('/review/:requestId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });

    const { action, note } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const request = await VerificationRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status    = action === 'approve' ? 'approved' : 'rejected';
    request.adminNote = note || '';
    await request.save();

    if (action === 'approve') {
      await User.findByIdAndUpdate(request.userId, {
        isVerified:     true,
        blueTickStatus: 'approved',
      });
    } else {
      await User.findByIdAndUpdate(request.userId, { blueTickStatus: 'rejected' });
    }

    // Emit notification via socket
    const io = req.app.get('io');
    if (io) {
      const notifMsg = action === 'approve'
        ? 'Your profile has been verified ✓'
        : `Verification rejected: ${note || 'Does not meet requirements'}`;
      io.to(request.userId.toString()).emit('notification', {
        type: 'verification',
        title: action === 'approve' ? 'Verified! ✓' : 'Verification Rejected',
        message: notifMsg,
      });
    }

    res.json({ success: true, message: `Request ${action}d` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
