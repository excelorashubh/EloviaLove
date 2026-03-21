const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selfieImage: { type: String, required: true },
  idProof:    { type: String, default: '' },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
