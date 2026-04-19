const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  content:         { type: String, required: true },   // HTML / Markdown
  excerpt:         { type: String, default: '' },       // short description
  featuredImage:   { type: String, default: '' },       // URL or base64
  author:          { type: String, default: 'EloviaLove Team' },
  tags:            [{ type: String, trim: true }],
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  isPublished:     { type: Boolean, default: false },
  publishedAt:     { type: Date },
  views:           { type: Number, default: 0 },
  faqs: [{
    question: { type: String, required: true },
    answer:   { type: String, required: true },
  }],
}, { timestamps: true });

// Auto-set publishedAt when first published
blogSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
