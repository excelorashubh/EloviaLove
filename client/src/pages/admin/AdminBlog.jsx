import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2,
  AlertCircle, Globe, FileText, Tag, Image, Search, Upload, UploadCloud,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

// ── Slug generator ────────────────────────────────────────────────────────────
const toSlug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Image uploader ────────────────────────────────────────────────────────────
const ImageUploader = ({ value, onChange }) => {
  const inputRef  = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return; }
    setError('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => { onChange(e.target.result); setUploading(false); };
    reader.onerror = () => { setError('Failed to read file'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  return (
    <div className="space-y-2">
      {value ? (
        /* Preview with replace/remove controls */
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
          <img src={value} alt="Featured" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <Upload size={13} /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragging
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/50'
          }`}
        >
          {uploading ? (
            <Loader2 size={24} className="text-primary-500 animate-spin" />
          ) : (
            <>
              <UploadCloud size={28} className={dragging ? 'text-primary-500' : 'text-slate-300'} />
              <p className="text-sm font-medium text-slate-500">
                {dragging ? 'Drop image here' : 'Click or drag & drop to upload'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP — max 5 MB</p>
            </>
          )}
        </div>
      )}

      {/* Also allow URL paste */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400">or paste URL</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <input
        value={value?.startsWith('data:') ? '' : (value || '')}
        onChange={e => { setError(''); onChange(e.target.value); }}
        placeholder="https://example.com/image.jpg"
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
};

// ── Blog post editor modal ────────────────────────────────────────────────────
const BlogModal = ({ post, onClose, onSave }) => {
  const isNew = !post?._id;
  const blank = {
    title: '', slug: '', content: '', excerpt: '', featuredImage: '',
    author: 'Elovia Love Team', tags: '', metaTitle: '', metaDescription: '', isPublished: false,
    faqs: [],
  };
  const [form, setForm]   = useState(post ? {
    ...post,
    tags:            (post.tags || []).join(', '),
    metaTitle:       post.metaTitle       || '',
    metaDescription: post.metaDescription || '',
    excerpt:         post.excerpt         || '',
    featuredImage:   post.featuredImage   || '',
    author:          post.author          || 'Elovia Love Team',
    faqs:            post.faqs            || [],
  } : blank);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [tab, setTab]       = useState('content'); // content | seo | settings

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-generate slug from title (new posts only)
  const handleTitle = (v) => {
    set('title', v);
    if (isNew) set('slug', toSlug(v));
    if (isNew && !form.metaTitle) set('metaTitle', v);
  };

  const submit = async () => {
    if (!form.title || !form.content) { setError('Title and content are required'); return; }
    setSaving(true); setError('');
    try {
      if (isNew) {
        await api.post('/blog', form);
      } else {
        await api.put(`/blog/${post._id}`, form);
      }
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'content',  label: 'Content',  icon: FileText },
    { id: 'seo',      label: 'SEO',      icon: Globe },
    { id: 'settings', label: 'Settings', icon: Tag },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-bold text-slate-900">{isNew ? 'New Blog Post' : 'Edit Post'}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* ── Content tab ── */}
          {tab === 'content' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={e => handleTitle(e.target.value)}
                  placeholder="e.g. 10 Signs You're in a Toxic Relationship"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Excerpt (short description)</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  rows={2}
                  placeholder="A short summary shown on the blog listing page..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Content * <span className="text-slate-400 font-normal">(HTML supported)</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  rows={14}
                  placeholder="Write your blog content here. You can use HTML tags like <h2>, <p>, <ul>, <strong>, <em>..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400 resize-y"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Supports HTML. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;blockquote&gt;, &lt;img&gt;
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  <Image size={12} className="inline mr-1" />Featured Image
                </label>
                <ImageUploader
                  value={form.featuredImage}
                  onChange={v => set('featuredImage', v)}
                />
              </div>
            </>
          )}

          {/* ── SEO tab ── */}
          {tab === 'seo' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  URL Slug
                  <span className="text-slate-400 font-normal ml-1">(auto-generated from title)</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-400">
                  <span className="px-3 py-2.5 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 shrink-0">/blog/</span>
                  <input
                    value={form.slug}
                    onChange={e => set('slug', toSlug(e.target.value))}
                    placeholder="my-blog-post-title"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Meta Title <span className="text-slate-400 font-normal">(under 60 chars)</span>
                </label>
                <input
                  value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)}
                  maxLength={60}
                  placeholder="SEO title shown in Google results"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <p className="text-xs text-slate-400 mt-1">{(form.metaTitle || '').length}/60 characters</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Meta Description <span className="text-slate-400 font-normal">(under 160 chars)</span>
                </label>
                <textarea
                  value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Compelling description shown in Google search results..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{(form.metaDescription || '').length}/160 characters</p>
              </div>
              {/* Google preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Google Preview</p>
                <p className="text-blue-700 text-base font-medium leading-tight truncate">
                  {form.metaTitle || form.title || 'Your Post Title'}
                </p>
                <p className="text-green-700 text-xs mt-0.5">elovialove.com/blog/{form.slug || 'your-post-slug'}</p>
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                  {form.metaDescription || form.excerpt || 'Your meta description will appear here...'}
                </p>
              </div>
            </>
          )}

          {/* ── Settings tab ── */}
          {tab === 'settings' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Author</label>
                <input
                  value={form.author}
                  onChange={e => set('author', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Tags <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="love, dating, heartbreak, relationships"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Publish Post</p>
                  <p className="text-xs text-slate-500">Make this post visible to everyone</p>
                </div>
                <div
                  onClick={() => set('isPublished', !form.isPublished)}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${form.isPublished ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>

              {/* FAQ Editor */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">FAQ Section</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Adds FAQ rich results in Google search</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('faqs', [...(form.faqs || []), { question: '', answer: '' }])}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    <Plus size={12} /> Add FAQ
                  </button>
                </div>
                {(form.faqs || []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No FAQs yet — click "Add FAQ"</p>
                )}
                {(form.faqs || []).map((faq, i) => (
                  <div key={i} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">FAQ {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => set('faqs', form.faqs.filter((_, idx) => idx !== i))}
                        className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <input
                      value={faq.question}
                      onChange={e => {
                        const updated = [...form.faqs];
                        updated[i] = { ...updated[i], question: e.target.value };
                        set('faqs', updated);
                      }}
                      placeholder="Question (e.g. Why am I not getting matches?)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={e => {
                        const updated = [...form.faqs];
                        updated[i] = { ...updated[i], answer: e.target.value };
                        set('faqs', updated);
                      }}
                      rows={2}
                      placeholder="Answer..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {isNew ? 'Publish Post' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main admin blog page ──────────────────────────────────────────────────────
const AdminBlog = () => {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/blog/admin/all');
      const postsWithMeta = r.data.posts.map(p => ({
        ...p,
        wordCount: (p.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length,
      }));
      setPosts(postsWithMeta);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Fetch full post data before opening edit modal
  const openEdit = async (post) => {
    setLoadingEdit(post._id);
    try {
      const r = await api.get(`/blog/admin/${post._id}`);
      setModal(r.data.post);
    } catch (e) {
      alert('Failed to load post for editing');
    } finally {
      setLoadingEdit(null);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post._id);
    try {
      await api.delete(`/blog/${post._id}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  const togglePublish = async (post) => {
    try {
      await api.put(`/blog/${post._id}`, { isPublished: !post.isPublished });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const published = posts.filter(p => p.isPublished).length;
  const drafts    = posts.length - published;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog Manager</h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage SEO-optimized blog posts</p>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-pink-500/30 transition-all"
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Posts', value: posts.length, color: 'text-slate-900' },
            { label: 'Published',   value: published,    color: 'text-green-600' },
            { label: 'Drafts',      value: drafts,       color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts by title or tag..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Title', 'Tags', 'Views', 'Words', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center"><Loader2 size={24} className="animate-spin text-primary-400 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No posts found</td></tr>
                ) : filtered.map(post => (
                  <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 max-w-[240px]">
                      <p className="font-semibold text-slate-900 truncate">{post.title}</p>
                      <p className="text-xs text-slate-400 truncate">/blog/{post.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded-full">{t}</span>
                        ))}
                        {post.tags?.length > 2 && <span className="text-[10px] text-slate-400">+{post.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{post.views || 0}</td>
                    <td className="px-5 py-3 text-slate-500">
                      <span className={`text-xs ${post.wordCount < 1200 ? 'text-amber-600 font-semibold' : 'text-green-600'}`}>
                        {post.wordCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(post.publishedAt || post.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          post.isPublished
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {post.isPublished ? <><Eye size={11} /> Published</> : <><EyeOff size={11} /> Draft</>}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(post)}
                          disabled={loadingEdit === post._id}
                          className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          {loadingEdit === post._id
                            ? <Loader2 size={14} className="animate-spin text-primary-400" />
                            : <Pencil size={14} />
                          }
                        </button>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-green-600 transition-colors">
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deleting === post._id}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {deleting === post._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <BlogModal
            post={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminBlog;
