import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Calendar, Eye, Tag, ArrowRight, Loader2, Heart, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import AdWrapper from '../components/ads/AdWrapper';
import BannerAd from '../components/ads/BannerAd';
import { STATIC_BLOG_POST_LIST } from '../data/seoContent';

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
    ? `"${q}" — Elovia Love Blog`
    : tag
      ? `#${tag} — Elovia Love Blog`
      : 'Love & Relationship Blog | Elovia Love';

  const pageDesc = q || tag
    ? `Browse Elovia Love blog articles about ${q || tag} — love, dating, and relationship advice for Indians.`
    : 'Explore love and relationship advice on Elovia Love. Find dating tips, communication guides, and confidence-building stories for modern Indian singles.';

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

  const mergedPosts = useMemo(() => {
    const combined = [...posts];
    STATIC_BLOG_POST_LIST.forEach((staticPost) => {
      if (!combined.some((post) => post.slug === staticPost.slug)) {
        combined.push(staticPost);
      }
    });
    return combined;
  }, [posts]);

  const visibleCount = Math.max(total, mergedPosts.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots"      content="index, follow" />
        <link rel="canonical"    href="https://elovialove.onrender.com/blog" />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content="https://elovialove.onrender.com/blog" />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="https://elovialove.onrender.com/EloviaLoveWB_small.png" />
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
              Love & Relationship Advice Blog
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

      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">A trusted resource for modern relationships</h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            Discover practical guidance for Indian singles and couples who want more from their relationships. Our blog brings together honest stories, mindful dating advice, and communication tools designed to help you build deeper, healthier connections without the guesswork.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            From first-date confidence to long-term commitment conversations, these articles are written to help you move forward with clarity. Each post is crafted to support your emotional growth, improve your dating choices, and make it easier to turn attraction into meaningful love.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            Explore our latest featured pieces below, including relationship checklists, heartbreak recovery tips, match-smart strategies, and practical ways to stay safe online. The Blog is your home for fresh insights, honest advice, and real-world steps toward stronger partnerships.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            Each article is written with Indian dating culture in mind, offering clear advice on communication, boundaries, dating safety, and how to find the right partner. If you want to make better first impressions, avoid fake profiles, and build lasting trust, this page is where to start.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            We update this blog regularly with new content for singles who want more than casual matches. Read stories from verified members, learn how to recover from heartbreak, and discover ways to keep your love life healthy while you search for a meaningful relationship.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            This page is built to be your central guide for modern relationship questions, from how to start a conversation after matching to knowing when to ask about commitment. Our goal is to make every step of your love journey easier, more confident, and more authentic.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            If you are looking for practical ideas for date planning, tips for managing misunderstandings, or tools to strengthen emotional connection, you will find them here. Every post includes real examples, expert-backed advice, and clear next actions you can use today.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            Browse the full collection below and use these articles as your relationship roadmap. Whether you are single, dating, or in a committed partnership, this blog is designed to help you make decisions that lead to deeper, safer, and more meaningful love.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            The Blog also includes practical checklists for digital dating safety, conversation starters, and ways to build trust early. If you want to feel more prepared before meeting someone new, these articles help you move confidently through every stage of the dating process.
          </p>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto mb-6">
            Use this page to access all of our relationship guides with one click. The internal links below connect directly to each article, so you can jump to the most relevant topic and continue exploring related posts from the same trusted advice hub.
          </p>
          <div className="mx-auto max-w-4xl mb-8 text-left">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Explore our latest posts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mergedPosts.slice(0, 12).map(post => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  • {post.title}
                </Link>
              ))}
              {!mergedPosts.length && (
                <p className="text-slate-500">Recent posts will appear here once they are loaded.</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 text-left mx-auto max-w-4xl">
            {mergedPosts.length > 0 ? (
              mergedPosts.slice(0, 4).map((post, index) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="block rounded-3xl border border-slate-200 p-4 text-slate-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <span className="font-semibold">{post.title}</span>
                </Link>
              ))
            ) : (
              <p className="text-slate-500">Explore trending relationship guides in the blog, including dating tips, safety advice, and real connection stories.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why this blog matters</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our content is written for Indian singles and relationship seekers who want to move beyond small talk and build emotional connection with confidence. Each article offers practical takeaways, real examples, and clear next steps so you can apply what you read right away.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            When you browse Elovia Love articles, you’ll find expert-backed advice on navigating dates, talking about commitment, protecting your privacy, and recognizing compatibility. We also cover self-care after heartbreak, dating boundaries, and how to nurture long-term love.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Read our latest articles to discover new ways to show up for love, understand your relationship needs, and create a strong foundation for the next phase of your romantic journey.
          </p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Helpful Guides for Indian Singles</h2>
          <p className="text-slate-600 mb-6 text-lg">
            Our blog publishes practical advice on dating safety, verified profiles, relationship communication, and building confidence — all written for singles in India.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3">Match smarter</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Learn how to create a trusted profile, spot fake accounts, and start conversations that lead to real relationships.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3">Stay safe</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Read our guides on online dating security, verified profiles, scam prevention, and protecting your privacy.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3">Find real love</h3>
              <p className="text-slate-600 text-sm leading-relaxed">This is your trusted space for long-term relationship advice, dating mindset, and building a better romantic future.</p>
            </div>
          </div>
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
            <span className="text-sm text-slate-400">{visibleCount} result{visibleCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="text-primary-500 animate-spin" />
          </div>
        ) : mergedPosts.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No posts found</p>
            <button onClick={() => setSearchParams({})} className="mt-3 text-primary-600 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mergedPosts.map((post, i) => <PostCard key={post._id} post={post} idx={i} />)}
          </div>
        )}

        {/* Ad */}
        {!loading && mergedPosts.length > 0 && (
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
