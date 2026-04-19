import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Calendar, Eye, Tag, ArrowRight, Loader2, Heart, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import AdWrapper from '../components/ads/AdWrapper';
import BannerAd from '../components/ads/BannerAd';

const BASE_URL = 'https://elovialove.onrender.com';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function readingTime(content) {
  const words = (content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const PostCard = ({ post, idx }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.06 }}
    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group"
  >
    <Link to={`/blog/${post.slug}`}>
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-pink-100 overflow-hidden">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart size={40} className="text-primary-300" />
          </div>
        )}
      </div>
    </Link>
    <div className="p-5">
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full uppercase tracking-wide">
              {t}
            </span>
          ))}
        </div>
      )}
      <Link to={`/blog/${post.slug}`}>
        <h2 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && (
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1"><Eye size={12} />{post.views || 0}</span>
          {post.readingTime && <span className="flex items-center gap-1"><Clock size={12} />{post.readingTime} min</span>}
        </div>
        <Link to={`/blog/${post.slug}`} className="flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all text-xs">
          Read <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  </motion.article>
);

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const tag  = searchParams.get('tag') || '';
  const q    = searchParams.get('q')   || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (tag) params.set('tag', tag);
    if (q)   params.set('q', q);
    api.get(`/blog?${params}`)
      .then(r => { setPosts(r.data.posts); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, tag, q]);

  // Update document title for SEO — handled by Helmet below
  const pageTitle = q
    ? `"${q}" — EloviaLove Blog`
    : tag
      ? `#${tag} — EloviaLove Blog`
      : 'Love & Relationship Advice Blog — EloviaLove';

  const pageDesc = q || tag
    ? `Browse EloviaLove blog articles about ${q || tag} — love, dating, and relationship advice for Indians.`
    : 'Read expert love and relationship advice on EloviaLove. Dating tips, heartbreak recovery, and self-growth for young Indians.';

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search.trim()) p.set('q', search.trim());
    setSearchParams(p);
  };

  const goPage = (n) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', n);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots"      content="index, follow" />
        <link rel="canonical"    href={`${BASE_URL}/blog${q ? `?q=${q}` : tag ? `?tag=${tag}` : ''}`} />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content={`${BASE_URL}/blog`} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={`${BASE_URL}/EloviaLoveWB.png`} />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-pink-600 to-rose-500 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
              💕 Love & Relationship Advice
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              EloviaLove Blog
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Real talk on love, dating, heartbreak & self-growth — for the modern Indian heart.
            </p>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button type="submit" className="px-5 py-3 bg-white text-primary-600 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors">
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Active filters */}
        {(q || tag) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-slate-500">Showing results for:</span>
            {q && (
              <span className="flex items-center gap-1.5 text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                <Search size={12} /> "{q}"
                <button onClick={() => setSearchParams({})} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            {tag && (
              <span className="flex items-center gap-1.5 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                <Tag size={12} /> #{tag}
                <button onClick={() => setSearchParams({})} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            <span className="text-sm text-slate-400">{total} result{total !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="text-primary-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No posts found</p>
            <button onClick={() => setSearchParams({})} className="mt-3 text-primary-600 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => <PostCard key={post._id} post={post} idx={i} />)}
          </div>
        )}

        {/* Ad */}
        {!loading && posts.length > 0 && (
          <div className="py-8 flex justify-center">
            <AdWrapper showUpgradeNudge><BannerAd slot="9876543210" /></AdWrapper>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => goPage(n)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  n === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
