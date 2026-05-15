import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Eye,
  Loader2,
  Heart,
  Clock,
  TrendingUp,
  Mail,
  ArrowRight,
  BookmarkPlus,
  Share2,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'All Articles',
  'Dating Advice',
  'Relationship Tips',
  'Emotional Healing',
  'Love Stories',
  'Breakup Recovery',
  'Self Love',
  'Marriage Advice',
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'mostRead', label: 'Most Read' },
];

// Blog Card Component
const BlogCard = ({ post, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5 },
    },
  };

  const hoverVariants = {
    hover: { y: -8, transition: { duration: 0.3 } },
  };

  const imageVariants = {
    hover: { scale: 1.08, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover="hover"
      variants={{
        hidden: cardVariants.hidden,
        visible: cardVariants.visible,
        hover: hoverVariants.hover,
      }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group relative h-full block"
        aria-label={`Read article: ${post.title}`}
      >
        {/* Glass Morphism Card */}
        <div className="h-full bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/40 shadow-lg hover:shadow-2xl transition-shadow duration-500 flex flex-col">
          {/* Featured Image */}
          <div className="relative aspect-video bg-linear-to-br from-rose-100 via-pink-100 to-purple-100 overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

            {post.featuredImage ? (
              <motion.img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                variants={imageVariants}
                whileHover="hover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-rose-200 to-pink-200">
                <Heart size={48} className="text-rose-400" strokeWidth={1.5} />
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-block px-4 py-2 bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                {post.category}
              </span>
            </div>

            {/* Read Time Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-full shadow-md">
                <Clock size={14} />
                {post.readTime} min
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Author & Date */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-600">By {post.author}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors duration-300 line-clamp-3 leading-snug">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-linear-to-r from-rose-50 to-pink-50 text-rose-700 text-xs font-medium rounded-full border border-rose-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-4 border-t border-slate-100">
              <div className="flex items-center gap-4 pt-3">
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {(post.views / 1000).toFixed(1)}K
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  {post.comments}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
              Read Story
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Featured Article Component
const FeaturedArticle = ({ post }) => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="bg-linear-to-br from-white to-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-video lg:aspect-auto overflow-hidden">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-linear-to-br from-rose-200 via-pink-200 to-purple-200"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
            />

            <motion.img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover relative z-10"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
            />

            {/* Badge */}
            <div className="absolute top-6 left-6 z-20">
              <span className="inline-block px-5 py-2 bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-xl">
                ⭐ Featured Article
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-rose-600 font-semibold text-sm uppercase tracking-wider">
                {post.category}
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-snug">
              {post.title}
            </h2>

            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{post.author}</p>
                <p className="text-sm text-slate-500">Love & Relationships Expert</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 mb-8 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-rose-500" />
                {post.readTime} min read
              </span>
              <span className="flex items-center gap-2">
                <Eye size={16} className="text-rose-500" />
                {post.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle size={16} className="text-rose-500" />
                {post.comments} comments
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  Read Full Story
                  <ArrowRight size={18} />
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors duration-300"
              >
                <BookmarkPlus size={18} />
                Save Article
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Blog Component
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [sortBy, setSortBy] = useState('latest');
  const [displayLimit, setDisplayLimit] = useState(9);
  const searchInputRef = useRef(null);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Blog] Fetching posts from server...');

        const res = await api.get('/blog?page=1&limit=50');
        console.log('[Blog] API Response:', res.data);

        const apiPosts = Array.isArray(res.data?.posts) ? res.data.posts : [];

        if (apiPosts.length === 0) {
          setError('No blog posts available');
          setPosts([]);
        } else {
          setPosts(apiPosts);
        }
      } catch (err) {
        console.error('[Blog] Fetch error:', err);
        setError(err.message || 'Failed to load blog posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter and sort posts
  useEffect(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All Articles') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.comments || 0) - (a.comments || 0));
        break;
      case 'mostRead':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'latest':
      default:
        filtered.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedCategory, sortBy]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Floating elements animation
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const featured = posts.find((p) => p.isFeatured) || posts[1];
  const trendingPosts = [...posts].sort((a, b) => (b.comments || 0) - (a.comments || 0)).slice(0, 5);
  const displayedPosts = filteredPosts.slice(0, displayLimit);

  // SEO JSON-LD Schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Elovia Love - Love & Relationship Advice Blog',
    description:
      'Expert dating advice, relationship tips, emotional healing guides, and love stories for modern Indian singles.',
    url: 'https://elovialove.onrender.com/blog',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=630&fit=crop',
    publisher: {
      '@type': 'Organization',
      name: 'Elovia Love',
      logo: {
        '@type': 'ImageObject',
        url: 'https://elovialove.onrender.com/logo.png',
      },
    },
    mainEntity: {
      '@type': 'Article',
      headline: featured?.title || 'Love & Relationship Advice',
      image: featured?.featuredImage,
      datePublished: featured?.publishedAt,
      author: {
        '@type': 'Person',
        name: featured?.author || 'Elovia Love',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://elovialove.onrender.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://elovialove.onrender.com/blog',
      },
    ],
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>
          Love & Relationship Blog | Dating Tips, Advice & Stories | Elovia Love
        </title>
        <meta
          name="description"
          content="Discover expert dating advice, relationship tips, emotional healing guides, and romantic inspiration. Real talk on love for modern Indian singles. Read now!"
        />
        <meta
          name="keywords"
          content="relationship advice, dating tips, emotional healing, love stories, breakup recovery, self-love, marriage advice, compatibility, dating guidance"
        />
        <meta name="author" content="Elovia Love" />
        <link
          rel="canonical"
          href="https://elovialove.onrender.com/blog"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://elovialove.onrender.com/blog"
        />
        <meta
          property="og:title"
          content="Love & Relationship Blog | Elovia Love"
        />
        <meta
          property="og:description"
          content="Expert dating advice, relationship tips, and love stories for modern Indian singles."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=630&fit=crop"
        />
        <meta property="og:site_name" content="Elovia Love" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content="https://elovialove.onrender.com/blog"
        />
        <meta name="twitter:title" content="Love & Relationship Blog" />
        <meta
          name="twitter:description"
          content="Discover expert dating advice and relationship tips."
        />
        <meta
          name="twitter:image"
          content="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=630&fit=crop"
        />

        {/* Additional Meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-linear-to-br from-slate-50 via-rose-50 to-pink-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"
            animate={{
              y: [0, 50, 0],
              x: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"
            animate={{
              y: [0, -50, 0],
              x: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* HERO SECTION */}
        <motion.section
          className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-linear-to-br from-rose-500/5 via-pink-500/5 to-purple-500/5 backdrop-blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 bg-linear-to-r from-rose-100 to-pink-100 text-rose-700 text-xs font-bold uppercase tracking-widest rounded-full border border-rose-200">
                💕 Love & Relationships
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
            >
              Love Stories,{' '}
              <span className="bg-linear-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Relationship Advice
              </span>{' '}
              & Emotional Insights
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Discover expert dating advice, emotional healing guides, relationship tips, and romantic inspiration from Elovia Love.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                Explore Articles
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="px-8 py-4 border-2 border-rose-500 text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors inline-flex items-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="relative h-20 flex justify-center items-center gap-8">
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="text-4xl"
              >
                💕
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                transition={{ delay: 0.2 }}
                className="text-4xl"
              >
                ✨
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                transition={{ delay: 0.4 }}
                className="text-4xl"
              >
                💫
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* FEATURED ARTICLE */}
        {featured && (
          <motion.section
            className="max-w-6xl mx-auto px-4 mb-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FeaturedArticle post={featured} />
          </motion.section>
        )}

        {/* SEARCH & FILTERS */}
        <motion.section
          className="max-w-6xl mx-auto px-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/40 shadow-lg">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search articles, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
                aria-label="Search blog articles"
              />
            </div>

            {/* Filters Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                        selectedCategory === category
                          ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 border-2 border-slate-200 rounded-full text-slate-900 font-semibold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400"
                    size={16}
                  />
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-6 text-sm text-slate-600">
              Showing <span className="font-semibold">{displayedPosts.length}</span> of{' '}
              <span className="font-semibold">{filteredPosts.length}</span> articles
            </div>
          </div>
        </motion.section>

        {/* LOADING STATE */}
        {loading && (
          <motion.div
            className="max-w-6xl mx-auto px-4 py-20 text-center"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold">
              Loading your love stories...
            </p>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <motion.div
            className="max-w-6xl mx-auto px-4 py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold mb-2">
              Unable to load articles
            </p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* NO POSTS STATE */}
        {!loading && !error && filteredPosts.length === 0 && (
          <motion.div
            className="max-w-6xl mx-auto px-4 py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold mb-2">
              No articles found
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Try adjusting your search or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Articles');
                searchInputRef.current?.focus();
              }}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* BLOG GRID */}
        {!loading && !error && filteredPosts.length > 0 && (
          <motion.section
            className="max-w-6xl mx-auto px-4 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {displayedPosts.map((post, index) => (
                <BlogCard key={post._id || post.slug || index} post={post} index={index} />
              ))}
            </div>

            {/* Load More Button */}
            {displayLimit < filteredPosts.length && (
              <motion.div
                className="flex justify-center mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDisplayLimit(displayLimit + 6)}
                  className="px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
                >
                  Load More Stories
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* TRENDING SIDEBAR */}
        <motion.section
          className="max-w-6xl mx-auto px-4 mb-20 grid lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Trending Articles */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-rose-500" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Trending Now</h3>
              </div>

              <div className="space-y-4">
                {trendingPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block p-4 rounded-2xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-rose-600 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Eye size={12} />
                            {(post.views / 1000).toFixed(1)}K views
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter & Related Links */}
          <div className="lg:col-span-2 space-y-8">
            {/* Newsletter */}
            <motion.div
              className="bg-linear-to-br from-rose-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl p-8 border border-rose-200/30 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-rose-600" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">
                  Get Love Advice 💌
                </h3>
              </div>

              <p className="text-slate-600 mb-6">
                Join thousands improving their relationships every week. Get expert tips delivered to your inbox.
              </p>

              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-white rounded-full border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full hover:shadow-lg transition-shadow"
                >
                  Subscribe
                </motion.button>
              </form>

              <p className="text-xs text-slate-600 mt-3">
                ✅ No spam • 📧 Weekly insights • 💌 Love-focused
              </p>
            </motion.div>

            {/* Internal Links */}
            <motion.div
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Explore More
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Matchmaking', path: '/matches' },
                  { label: 'Compatibility', path: '/discover' },
                  { label: 'Dating Safety', path: '/safety-hub' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Community', path: '/discover' },
                ].map((link) => (
                  <motion.div
                    key={link.path}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      to={link.path}
                      className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors group"
                    >
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA SECTION */}
        <motion.section
          className="max-w-6xl mx-auto px-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-rose-500 via-pink-500 to-purple-600"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            />

            <div className="relative z-10 px-8 py-16 md:px-12 md:py-20 text-center text-white">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Ready to Find Your Perfect Match?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              >
                Join thousands of singles using Elovia Love to build meaningful connections.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white text-rose-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-shadow inline-flex items-center gap-2"
                >
                  Start Your Love Journey
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.section
          className="max-w-6xl mx-auto px-4 py-12 text-center border-t border-slate-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-600 mb-4">
            Didn't find what you're looking for?
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-rose-500 text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors"
            >
              Get in Touch
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </>
  );
};

export default Blog;
