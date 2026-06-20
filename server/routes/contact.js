const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { sendEmail, buildAdminNotificationEmail, buildAutoReplyEmail } = require('../utils/email');

const router = express.Router();

const sanitizePhone = (phone) => phone ? phone.trim().replace(/\s+/g, ' ') : '';

const preventDuplicates = async (email, subject, message, ipAddress) => {
  const threshold = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes
  const existing = await ContactMessage.findOne({
    email,
    subject,
    message,
    ipAddress,
    createdAt: { $gte: threshold }
  });
  return !!existing;
};

router.post(
  '/',
  optionalAuth,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 3, max: 100 }).withMessage('Full name must be between 3 and 100 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 7, max: 20 }).withMessage('Please provide a valid phone number'),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ min: 5, max: 120 }).withMessage('Subject must be between 5 and 120 characters'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 15, max: 2000 }).withMessage('Message must be between 15 and 2000 characters'),
    body('honeypot').optional().custom((value) => {
      if (value) throw new Error('Spam detected');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array().map(err => ({ field: err.param, message: err.msg })) });
    }

    try {
      const { fullName, email, phone, subject, message } = req.body;
      const normalizedPhone = sanitizePhone(phone);
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || ''; // preserve origin
      const userAgent = req.get('User-Agent') || '';
      const userId = req.user?.id || null;
      const verified = req.user?.isVerified || false;

      const duplicate = await preventDuplicates(email, subject, message, ipAddress);
      if (duplicate) {
        return res.status(429).json({ success: false, message: 'Please wait a few minutes before sending the same message again.' });
      }

      const contact = await ContactMessage.create({
        userId,
        fullName,
        email,
        phone: normalizedPhone,
        subject,
        message,
        ipAddress,
        userAgent,
        status: 'New',
        priority: 'Normal'
      });

      const adminMail = buildAdminNotificationEmail({
        fullName,
        email,
        phone: normalizedPhone,
        subject,
        message,
        userId,
        verified,
        createdAt: contact.createdAt,
        ipAddress,
        userAgent
      });
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || 'exceloraclasses@gmail.com',
        ...adminMail
      });

      const autoReply = buildAutoReplyEmail({ fullName, email, phone: normalizedPhone, subject });
      await sendEmail({
        to: email,
        ...autoReply
      });

      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('contact_message_created', contact);
      }

      return res.json({ success: true, message: 'Message sent successfully. Our team will respond shortly.' });
    } catch (error) {
      console.error('Contact message error:', error);
      return res.status(500).json({ success: false, message: 'Unable to send your message at this time. Please try again later.' });
    }
  }
);

// Admin endpoints
router.get('/admin/messages', protect, authorize('admin'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = req.query.status;
    const priority = req.query.priority;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) {
      filters.$text = { $search: search };
    }

    const [messages, total] = await Promise.all([
      ContactMessage.find(filters)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email profilePhoto isVerified')
        .lean(),
      ContactMessage.countDocuments(filters)
    ]);

    res.json({ success: true, messages, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/messages/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await ContactMessage.findById(req.params.id).populate('userId', 'name email profilePhoto isVerified');
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: contact });
  } catch (error) {
    console.error('Admin get message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/messages/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;
    const update = {};
    if (status && ['New', 'Read', 'Replied', 'Archived'].includes(status)) {
      update.status = status;
      if (status === 'Read') update.readAt = new Date();
      if (status === 'Replied') update.repliedAt = new Date();
    }
    if (priority && ['Low', 'Normal', 'High'].includes(priority)) update.priority = priority;
    if (typeof adminNotes === 'string') update.adminNotes = adminNotes.trim();

    const contact = await ContactMessage.findByIdAndUpdate(req.params.id, update, { new: true }).populate('userId', 'name email profilePhoto isVerified');
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('contact_message_updated', contact);
    }

    res.json({ success: true, message: 'Message updated successfully', contact });
  } catch (error) {
    console.error('Admin update message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/messages/:id/reply', protect, authorize('admin'), [
  body('replyText').trim().notEmpty().withMessage('Reply cannot be empty').isLength({ min: 5, max: 2000 }).withMessage('Reply must be between 5 and 2000 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array().map(err => ({ field: err.param, message: err.msg })) });
  }

  try {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    contact.status = 'Replied';
    contact.replyText = req.body.replyText.trim();
    contact.repliedAt = new Date();
    await contact.save();

    const replyEmail = {
      subject: `Re: ${contact.subject} - Elovia Support`,
      html: `
        <div style="font-family: Inter, sans-serif; color: #111827;">
          <p>Hi ${contact.fullName},</p>
          <p>Thank you for reaching out. Our support team has responded to your message below.</p>
          <div style="margin: 1rem 0; padding: 1rem; background: #f8fafc; border-radius: 16px;">
            <p><strong>Your original message:</strong></p>
            <p>${contact.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <div style="margin: 1rem 0; padding: 1rem; background: #fff7ed; border-radius: 16px;">
            <p><strong>Support reply:</strong></p>
            <p>${contact.replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <p>If you have any additional questions, feel free to reply to this email.</p>
          <p>Best regards,<br />Elovia Support Team</p>
        </div>
      `,
      text: `Hi ${contact.fullName},\n\nThank you for reaching out. Our support team has responded to your message below.\n\nYour original message:\n${contact.message}\n\nSupport reply:\n${contact.replyText}\n\nIf you have any additional questions, feel free to reply to this email.\n\nBest regards,\nElovia Support Team`
    };

    await sendEmail({ to: contact.email, ...replyEmail });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('contact_message_updated', contact);
    }

    res.json({ success: true, message: 'Reply sent successfully', contact });
  } catch (error) {
    console.error('Admin reply message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/messages/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('contact_message_deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Admin delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/messages/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const totals = await ContactMessage.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newCount: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
          readCount: { $sum: { $cond: [{ $eq: ['$status', 'Read'] }, 1, 0] } },
          repliedCount: { $sum: { $cond: [{ $eq: ['$status', 'Replied'] }, 1, 0] } },
          archivedCount: { $sum: { $cond: [{ $eq: ['$status', 'Archived'] }, 1, 0] } }
        }
      }
    ]);

    const stats = totals[0] || { total: 0, newCount: 0, readCount: 0, repliedCount: 0, archivedCount: 0 };
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
