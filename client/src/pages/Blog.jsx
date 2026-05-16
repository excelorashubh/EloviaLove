import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Eye,
  Heart,
  Clock,
  TrendingUp,
  Mail,
  ArrowRight,
  BookmarkPlus,
  MessageCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { getBlogPosts } from '../data/blogData';

const CATEGORIES = [
  'All Articles',
  'Dating Advice',
  'Relationship Tips',
  'Emotional Healing',
  'Self Love',
  'Marriage Advice',
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'mostRead', label: 'Most Read' },
];

const BlogCard = ({ post, index }) => {
  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className="relative overflow-hidden h-56 bg-slate-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=500&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            {post.category}
          </span>
        </div>

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span>By {post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-3">
            {post.title}
          </h2>

          <p className="text-sm text-slate-600 flex-1 mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={12} />
              {post.views.toLocaleString()} views
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} min read
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedArticle = ({ post }) => {
  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(15,23,42,0.06)] overflow-hidden border border-slate-200"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <div className="p-10 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 mb-4">
              Featured Story
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-5">
              {post.title}
            </h2>
            <p className="text-lg text-slate-600 leading-8">
              {post.excerpt}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye size={16} />
                {post.views.toLocaleString()} views
              </span>
            </div>
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 self-start rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-rose-700 transition-colors"
            >
              Read Full Story
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Blog = () => {
  if (typeof window !== 'undefined') {
    console.log('[Blog] rendering');
  }

  const posts = useMemo(() => getBlogPosts(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [sortBy, setSortBy] = useState('latest');
  const [displayLimit, setDisplayLimit] = useState(9);
  const searchInputRef = useRef(null);

  const filteredPosts = useMemo(() => {
    let results = posts;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter((post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'All Articles') {
      results = results.filter((post) => post.category === selectedCategory);
    }

    switch (sortBy) {
      case 'popular':
        return [...results].sort((a, b) => b.views - a.views);
      case 'trending':
        return [...results].sort((a, b) => b.comments - a.comments);
      case 'mostRead':
        return [...results].sort((a, b) => b.readTime - a.readTime);
      default:
        return [...results].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const featured = posts.find((post) => post.isFeatured) || posts[0];
  const trendingPosts = [...posts]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 4);
  const displayedPosts = filteredPosts.slice(0, displayLimit);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Elovia Love Blog',
    description:
      'Expert dating advice, relationship tips, and emotional healing guides for modern singles in India.',
    url: 'https://elovialove.onrender.com/blog',
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
        <title>Love & Relationship Blog | Elovia Love</title>
        <meta
          name="description"
          content="Discover dating advice, relationship tips, emotional healing guides, and inspiring love stories from Elovia Love."
        />
        <link rel="canonical" href="https://elovialove.onrender.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elovialove.onrender.com/blog" />
        <meta property="og:title" content="Love & Relationship Blog | Elovia Love" />
        <meta
          property="og:description"
          content="Discover dating advice, relationship tips, emotional healing guides, and inspiring love stories from Elovia Love."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=630&fit=crop"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Love & Relationship Blog | Elovia Love" />
        <meta
          name="twitter:description"
          content="Discover dating advice, relationship tips, emotional healing guides, and inspiring love stories from Elovia Love."
        />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=630&fit=crop" />
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-linear-to-br from-slate-50 via-rose-50 to-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mx-auto max-w-3xl mb-16">
            <span className="inline-flex items-center rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700">
              Dating Blog
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Real advice for modern love.
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Fresh insights, safety tips, and relationship stories designed for singles and couples navigating love in India.
            </p>
          </div>

          <div className="grid gap-10 xl:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-10">
              {featured && <FeaturedArticle post={featured} />}

              <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search articles, topics, authors..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            selectedCategory === category
                              ? 'bg-rose-500 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className="relative inline-flex w-full max-w-xs">
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-4 pr-10 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-sm text-slate-500">
                  Showing <span className="font-semibold">{displayedPosts.length}</span> of <span className="font-semibold">{filteredPosts.length}</span> articles.
                </p>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                {displayedPosts.map((post, index) => (
                  <BlogCard key={post._id} post={post} index={index} />
                ))}
              </section>

              {displayLimit < filteredPosts.length && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((value) => value + 6)}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700"
                  >
                    Load more stories
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {filteredPosts.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                  <Heart size={44} className="mx-auto text-rose-500 mb-4" />
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">No articles found</h2>
                  <p className="text-slate-500 mb-6">Try a different search term or explore another category.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Articles');
                      searchInputRef.current?.focus();
                    }}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            <aside className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp size={24} className="text-rose-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Trending now</h2>
                    <p className="text-sm text-slate-500">Our most talked-about stories.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {trendingPosts.map((post, index) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="block rounded-3xl border border-slate-100 p-4 hover:border-rose-200 hover:bg-rose-50 transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{post.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{post.readTime} min read</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Mail size={24} className="text-rose-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Love advice in your inbox</h2>
                    <p className="text-sm text-slate-500">Get weekly relationship tips and safety updates.</p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
