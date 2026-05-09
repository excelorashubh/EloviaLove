import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Eye, Tag, ArrowRight, Loader2, Heart, Clock, BookOpen } from 'lucide-react';
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

const DatingTips = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch all published posts and filter for dating/relationship tags
    api.get('/blog?page=1&limit=100') // Get many posts
      .then(r => {
        const allPosts = r.data.posts;
        // Filter posts with relevant tags
        const datingTags = ['love', 'dating', 'relationships', 'romance', 'heartbreak', 'matches', 'compatibility', 'communication', 'trust', 'commitment'];
        const filtered = allPosts.filter(post =>
          post.tags?.some(tag => datingTags.includes(tag.toLowerCase()))
        );
        setPosts(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pageTitle = 'Dating Tips & Relationship Advice — Elovia Love';
  const pageDescription = 'Expert dating tips and relationship advice for Indians. Learn how to find love, build healthy relationships, and navigate modern dating in India.';
  const pageUrl = `${BASE_URL}/blog/dating-tips`;
  const pageImage = `${BASE_URL}/EloviaLoveWB_small.png`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content="Elovia Love" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />

        {/* JSON-LD for CollectionPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Dating Tips & Relationship Advice',
            description: pageDescription,
            url: pageUrl,
            mainEntity: {
              '@type': 'ItemList',
              name: 'Dating Tips Articles',
              numberOfItems: posts.length,
              itemListElement: posts.map((post, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                item: {
                  '@type': 'BlogPosting',
                  headline: post.title,
                  url: `${BASE_URL}/blog/${post.slug}`,
                  datePublished: post.publishedAt,
                  author: { '@type': 'Person', name: post.author || 'Elovia Love Team' },
                },
              })),
            },
            publisher: {
              '@type': 'Organization',
              name: 'Elovia Love',
              logo: { '@type': 'ImageObject', url: `${BASE_URL}/EloviaLoveWB_small.png` },
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4"
            >
              <BookOpen size={16} />
              Dating Tips Hub
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
              Dating Tips & Relationship Advice
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Expert guidance on finding love, building healthy relationships, and navigating modern dating in India.
              From first dates to long-term commitment, we've got you covered.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: 'Articles', value: posts.length },
              { label: 'Topics Covered', value: '10+' },
              { label: 'Expert Tips', value: '50+' },
              { label: 'Updated Daily', value: '✓' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-primary-600">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={40} className="text-primary-500 animate-spin" />
            </div>
          )}

          {/* Posts Grid */}
          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {posts.map((post, idx) => (
                <PostCard key={post._id} post={post} idx={idx} />
              ))}
            </motion.div>
          )}

          {/* No posts */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-20">
              <Heart size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">No articles yet</h3>
              <p className="text-slate-500">Check back soon for dating tips and relationship advice!</p>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary-600 to-pink-600 rounded-3xl p-8 text-white text-center"
          >
            <Heart size={36} className="mx-auto mb-3 fill-white/30" />
            <h3 className="text-2xl font-extrabold mb-2">Ready to Apply These Tips?</h3>
            <p className="text-white/80 mb-5 text-sm max-w-md mx-auto">
              Join thousands of Indians finding real love on Elovia Love. Start your free trial today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-colors text-sm"
            >
              Join Elovia Love Free <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DatingTips;