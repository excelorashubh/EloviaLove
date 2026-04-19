import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Eye, Tag, ArrowLeft, ArrowRight, Heart, Share2, Loader2, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import AdWrapper from '../components/ads/AdWrapper';
import BannerAd from '../components/ads/BannerAd';

const BASE_URL = 'https://elovialove.onrender.com';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Reading time ──────────────────────────────────────────────────────────────
function readingTime(content) {
  const words = (content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Related post card ─────────────────────────────────────────────────────────
const RelatedCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
    <div className="aspect-video bg-primary-50 overflow-hidden">
      {post.featuredImage
        ? <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        : <div className="w-full h-full flex items-center justify-center"><Heart size={20} className="text-primary-200" /></div>
      }
    </div>
    <div className="p-4">
      <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-1">{post.title}</p>
      <p className="text-xs text-slate-400">{formatDate(post.publishedAt)}</p>
    </div>
  </Link>
);

// ── Main component ────────────────────────────────────────────────────────────
const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost]         = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setPost(null);
    api.get(`/blog/${slug}`)
      .then(r => { setPost(r.data.post); setRelated(r.data.related || []); })
      .catch(e => { if (e.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  const share = async () => {
    const url = `${BASE_URL}/blog/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: post.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── SEO meta via Helmet ───────────────────────────────────────────────────
  const pageTitle       = post ? `${post.metaTitle || post.title} — EloviaLove` : 'EloviaLove Blog';
  const pageDescription = post?.metaDescription || post?.excerpt || 'Read love and relationship advice on EloviaLove.';
  const pageImage       = post?.featuredImage || `${BASE_URL}/EloviaLoveWB.png`;
  const pageUrl         = `${BASE_URL}/blog/${slug}`;
  const mins            = post ? readingTime(post.content) : 0;

  // JSON-LD structured data
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline:        post.title,
    description:     post.excerpt || post.metaDescription || '',
    image:           pageImage,
    author:          { '@type': 'Person', name: post.author || 'EloviaLove Team' },
    publisher: {
      '@type':  'Organization',
      name:     'EloviaLove',
      logo:     { '@type': 'ImageObject', url: `${BASE_URL}/EloviaLoveWB.png` },
    },
    datePublished:   post.publishedAt,
    dateModified:    post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    keywords:        (post.tags || []).join(', '),
    timeRequired:    `PT${mins}M`,
  } : null;

  if (loading) return (
    <>
      <Helmet><title>Loading... — EloviaLove</title></Helmet>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader2 size={40} className="text-primary-500 animate-spin" />
        </div>
      </div>
    </>
  );

  if (notFound) return (
    <>
      <Helmet>
        <title>Post Not Found — EloviaLove</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <Heart size={56} className="text-slate-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Post not found</h1>
          <p className="text-slate-500 mb-6">This article may have been moved or deleted.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Dynamic SEO ── */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description"        content={pageDescription} />
        <meta name="robots"             content="index, follow" />
        <link rel="canonical"           href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type"        content="article" />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:image"       content={pageImage} />
        <meta property="og:site_name"   content="EloviaLove" />
        <meta property="og:locale"      content="en_IN" />
        {post.publishedAt && <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />}
        {post.updatedAt   && <meta property="article:modified_time"  content={new Date(post.updatedAt).toISOString()} />}
        {(post.tags || []).map(t => <meta key={t} property="article:tag" content={t} />)}

        {/* Twitter */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image"       content={pageImage} />

        {/* JSON-LD */}
        {jsonLd && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Featured image */}
        {post.featuredImage && (
          <div className="w-full bg-slate-100" style={{ aspectRatio: '4 / 1' }}>
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-contain object-center block"
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── Main content ── */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              {/* Back */}
              <button onClick={() => navigate('/blog')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft size={16} /> All Articles
              </button>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(t => (
                    <Link key={t} to={`/blog?tag=${t}`} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors">
                      <Tag size={10} /> {t}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                {post.title}
              </h1>

              {/* Author + meta bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-6 border-b border-slate-100">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {post.author?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{post.author}</p>
                    <p className="text-[10px] text-slate-400">EloviaLove Team</p>
                  </div>
                </div>
                <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(post.publishedAt)}</span>
                <span className="flex items-center gap-1"><Clock size={13} />{mins} min read</span>
                <span className="flex items-center gap-1"><Eye size={13} />{post.views} views</span>
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 ml-auto text-primary-600 hover:text-primary-700 font-semibold transition-colors text-xs"
                >
                  <Share2 size={13} /> {copied ? '✓ Copied!' : 'Share'}
                </button>
              </div>

              {/* Content */}
              <div
                className="prose prose-slate prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-slate-700 prose-li:mb-1
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900
                  prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                  prose-img:rounded-2xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Ad */}
              <div className="my-10 flex justify-center">
                <AdWrapper showUpgradeNudge><BannerAd slot="1122334455" /></AdWrapper>
              </div>

              {/* CTA */}
              <div className="mt-10 bg-gradient-to-br from-primary-600 to-pink-600 rounded-3xl p-8 text-white text-center">
                <Heart size={36} className="mx-auto mb-3 fill-white/30" />
                <h3 className="text-2xl font-extrabold mb-2">Ready to Find Your Person?</h3>
                <p className="text-white/80 mb-5 text-sm max-w-sm mx-auto">
                  Join thousands of Indians finding real love on EloviaLove. Start your free trial today.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-colors text-sm"
                >
                  Start Free Trial <ArrowRight size={16} />
                </Link>
              </div>

              {/* Keep Reading — bottom related posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Keep Reading</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map(r => <RelatedCard key={r._id} post={r} />)}
                  </div>
                </div>
              )}
            </motion.article>

            {/* ── Sidebar ── */}
            <aside className="lg:w-72 shrink-0 space-y-6">

              {/* Related posts sidebar */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Related Articles</h3>
                  <div className="space-y-4">
                    {related.map(r => (
                      <Link key={r._id} to={`/blog/${r.slug}`} className="flex gap-3 group">
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-primary-50">
                          {r.featuredImage
                            ? <img src={r.featuredImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            : <div className="w-full h-full flex items-center justify-center"><Heart size={14} className="text-primary-200" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{r.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(r.publishedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags cloud */}
              {post.tags?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(t => (
                      <Link key={t} to={`/blog?tag=${t}`} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors">
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky CTA */}
              <div className="bg-gradient-to-br from-primary-50 to-pink-50 border border-primary-100 rounded-2xl p-5 text-center sticky top-6">
                <Heart size={28} className="text-primary-500 mx-auto mb-2" />
                <p className="font-bold text-slate-900 text-sm mb-1">Find Love on EloviaLove</p>
                <p className="text-xs text-slate-500 mb-3">10 days free premium trial</p>
                <Link to="/signup" className="block w-full py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-md transition-all">
                  Join Free →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
