const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is incomplete. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASS.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Excelora Classes <noreply@exceloraclasses.com>',
    to,
    subject,
    text,
    html,
  });
  return info;
};

const buildAdminNotificationEmail = ({ fullName, email, phone, subject, message, userId, verified, createdAt, ipAddress, userAgent }) => {
  return {
    subject: '📩 New Contact Message - Elovia',
    html: `
      <div style="font-family: Inter, sans-serif; color: #111827;">
        <h2 style="margin-bottom: 0.75rem; color:#111827;">New Contact Message Received</h2>
        <p style="margin-bottom: 1rem; color:#4b5563;">A visitor submitted a message through the Elovia contact form.</p>
        <table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
          ${[ 
            ['Full Name', fullName],
            ['Email', email],
            ['Phone', phone || 'Not provided'],
            ['Subject', subject],
            ['Status', 'New'],
            ['Priority', 'Normal'],
            ['User ID', userId || 'Guest'],
            ['Verified', verified ? 'Yes' : 'No'],
            ['IP Address', ipAddress || 'Unknown'],
            ['User Agent', userAgent || 'Unknown'],
            ['Submitted At', new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]
          ].map(([label, value]) => `
            <tr>
              <td style="padding: 8px 0; font-weight: 600; width: 140px; color:#111827;">${label}</td>
              <td style="padding: 8px 0; color:#374151;">${value}</td>
            </tr>
          `).join('')}
        </table>
        <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 16px;">
          <h3 style="margin-bottom: 0.5rem; color:#111827;">Message</h3>
          <p style="margin: 0; color:#334155; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
      </div>
    `,
    text: `New Contact Message from ${fullName} (${email}). Subject: ${subject}. Message: ${message}`
  };
};

const buildAutoReplyEmail = ({ fullName, email, phone, subject }) => {
  return {
    subject: 'Thank you for contacting Elovia',
    html: `
      <div style="font-family: Inter, sans-serif; color: #111827;">
        <p>Hi ${fullName || 'there'},</p>
        <p>Thank you for contacting Elovia.</p>
        <p>We have received your message and our support team will review it shortly.</p>
        <div style="margin: 1rem 0; padding: 1rem; background: #f8fafc; border-radius: 16px;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Name:</strong> ${fullName}</p>
          <p style="margin: 0 0 0.5rem 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 0.5rem 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p style="margin: 0 0 0.5rem 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <p>We'll get back to you as soon as possible.</p>
        <p>Thank you for choosing Elovia.</p>
        <p><strong>Support Team</strong><br />Elovia</p>
      </div>
    `,
    text: `Hi ${fullName || 'there'},\n\nThank you for contacting Elovia. We have received your message and our support team will review it shortly.\n\nYour submitted details:\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject}\n\nWe'll get back to you as soon as possible.\n\nThank you for choosing Elovia.\n\nSupport Team\nElovia`
  };
};

module.exports = {
  sendEmail,
  buildAdminNotificationEmail,
  buildAutoReplyEmail
};
