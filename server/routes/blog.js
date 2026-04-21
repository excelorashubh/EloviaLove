const express = require('express');
const Blog    = require('../models/Blog');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── PUBLIC: GET /api/blog — list published posts (paginated) ─────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 9);
    const tag   = req.query.tag;
    const q     = req.query.q;

    const filter = { isPublished: true };
    if (tag) filter.tags = tag;
    if (q)   filter.$or = [
      { title:   { $regex: q, $options: 'i' } },
      { excerpt: { $regex: q, $options: 'i' } },
      { tags:    { $regex: q, $options: 'i' } },
    ];

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .select('title slug excerpt featuredImage author tags publishedAt views content')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Compute reading time without sending full content
    const postsWithMeta = posts.map(p => {
      const obj = p.toObject();
      const words = (obj.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      obj.readingTime = Math.max(1, Math.ceil(words / 200));
      delete obj.content; // don't send full content in listing
      return obj;
    });

    res.json({ success: true, posts: postsWithMeta, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUBLIC: GET /api/blog/:slug — single post + increment views ───────────────
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Related posts — same tags, exclude current
    const related = await Blog.find({
      isPublished: true,
      _id: { $ne: post._id },
      tags: { $in: post.tags },
    })
      .select('title slug excerpt featuredImage publishedAt')
      .limit(3);

    res.json({ success: true, post, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: GET /api/blog/admin/all — all posts (published + drafts) ───────────
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const posts = await Blog.find()
      .select('title slug isPublished publishedAt views tags createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: GET /api/blog/admin/:id — single post for editing ─────────────────
router.get('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: POST /api/blog — create post ──────────────────────────────────────
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, author, tags,
            metaTitle, metaDescription, isPublished } = req.body;

    const finalSlug = slug?.trim() || toSlug(title);

    // Ensure unique slug
    const exists = await Blog.findOne({ slug: finalSlug });
    if (exists) return res.status(400).json({ success: false, message: 'Slug already exists' });

    const post = await Blog.create({
      title, slug: finalSlug, content, excerpt, featuredImage,
      author: author || 'EloviaLove Team',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
      metaTitle:       metaTitle       || title,
      metaDescription: metaDescription || excerpt || '',
      isPublished:     !!isPublished,
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: PUT /api/blog/:id — update post ────────────────────────────────────
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    const update = {
      ...rest,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
    };
    const post = await Blog.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: DELETE /api/blog/:id ───────────────────────────────────────────────
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
