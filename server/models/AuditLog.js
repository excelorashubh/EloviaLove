const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. 'razorpay_resync'
  message: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
