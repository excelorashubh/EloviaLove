import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { SITE_URL } from '../data/seoContent';
import api from '../services/api';
import { getBlogImageUrl, getBlogRoute, normalizeBlogPost } from '../utils/blog';
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
  ChevronDown,
} from 'lucide-react';

const MotionDiv = motion.div;

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

const formatPublishedDate = (value, options) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', options)
    : 'Recently published';
};

const BlogImage = ({ post, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = getBlogImageUrl(post.featuredImage);

  if (!imageUrl || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-slate-100 ${className}`}>
        <Heart className="h-10 w-10 text-rose-300" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={post.title}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const BlogCard = ({ post, index }) => {
  if (!post?.slug) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:border-white/20 dark:bg-black"
    >
      <Link to={getBlogRoute(post.slug)} className="block h-full">
        <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-white/10">
          <BlogImage post={post} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            {post.category}
          </span>
        </div>

        <div className="p-6 flex flex-col h-full">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
            <span>By {post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {formatPublishedDate(post.publishedAt, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h2 className="mb-3 line-clamp-3 text-xl font-semibold text-slate-900 dark:text-white">
            {post.title}
          </h2>

          <p className="mb-6 flex-1 line-clamp-3 text-sm text-slate-600 dark:text-white/70">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
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
    </MotionDiv>
  );
};

const FeaturedArticle = ({ post }) => {
  if (!post?.slug) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.06)] dark:border-white/20 dark:bg-black"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative h-72 overflow-hidden bg-slate-100 dark:bg-white/10 sm:h-96">
          <BlogImage post={post} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <div className="p-10 flex flex-col justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              Featured Story
            </span>
            <h2 className="mb-5 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
              {post.title}
            </h2>
            <p className="text-lg leading-8 text-slate-600 dark:text-white/70">
              {post.excerpt}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-white/60">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                {formatPublishedDate(post.publishedAt, {
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
              to={getBlogRoute(post.slug)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-rose-700 transition-colors"
            >
              Read Full Story
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [sortBy, setSortBy] = useState('latest');
  const [displayLimit, setDisplayLimit] = useState(9);
  const searchInputRef = useRef(null);

  React.useEffect(() => {
    let isCurrent = true;

    api.get('/blogs', { params: { page: 1 } })
      .then(({ data }) => {
        if (!Array.isArray(data?.posts)) {
          throw new Error('Unexpected blog response structure');
        }
        if (!isCurrent) return;
        setPosts(data.posts.map(normalizeBlogPost).filter((post) => post?.slug));
        setPage(Number(data.page) || 1);
        setTotalPages(Math.max(1, Number(data.pages) || 1));
        setError(null);
      })
      .catch((err) => {
        console.error('Unable to load blogs:', err);
        if (isCurrent) {
          setError('Unable to load blogs. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  const loadMorePosts = async () => {
    setLoadMoreError('');
    if (displayLimit < filteredPosts.length) {
      setDisplayLimit((limit) => limit + 6);
      return;
    }
    if (page >= totalPages || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data } = await api.get('/blogs', { params: { page: nextPage } });
      if (!Array.isArray(data?.posts)) {
        throw new Error('Unexpected blog response structure');
      }
      setPosts((currentPosts) => [
        ...currentPosts,
        ...data.posts.map(normalizeBlogPost).filter((post) => (
          post?.slug && !currentPosts.some((currentPost) => currentPost.slug === post.slug)
        )),
      ]);
      setPage(Number(data.page) || nextPage);
      setTotalPages(Math.max(1, Number(data.pages) || totalPages));
      setDisplayLimit((limit) => limit + 6);
    } catch (loadError) {
      console.error('Unable to load more blogs:', loadError);
      setLoadMoreError('Unable to load more blogs. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let results = posts;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter((post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
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
        return [...results].sort((a, b) => b.views - a.views);
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
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
  const displayedPosts = filteredPosts.slice(0, displayLimit);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Elovia Love Blog',
    description:
      'Expert dating advice, relationship tips, and emotional healing guides for modern singles in India.',
    url: `${SITE_URL}/blog`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
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
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
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

      <div className="min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-rose-50 to-pink-50 text-slate-900 dark:bg-black dark:text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center mx-auto max-w-3xl mb-16">
            <span className="inline-flex items-center rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700">
              Dating Blog
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl">
              Real advice for modern love.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-white/70">
              Fresh insights, safety tips, and relationship stories designed for singles and couples navigating love in India.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading blog posts">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/20 dark:bg-black">
                  <div className="h-56 animate-pulse bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-4 p-6">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-6 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-rose-500 mb-4 bg-rose-50 p-4 rounded-full">
                <Heart size={32} className="text-rose-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{error}</h2>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setRetryCount((count) => count + 1);
                }}
                className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm text-white"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-rose-500 mb-4 bg-rose-50 p-4 rounded-full">
                <BookmarkPlus size={32} className="text-rose-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">No blog posts available yet.</h2>
              <p className="text-slate-500 dark:text-white/60">Check back later for fresh insights, safety tips, and relationship stories.</p>
            </div>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-10">
              {featured && <FeaturedArticle post={featured} />}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/20 dark:bg-black">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search articles, topics, authors..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
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
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20'
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
                        className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-4 pr-10 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/20 dark:bg-black dark:text-white"
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
                <p className="mt-6 text-sm text-slate-500 dark:text-white/60">
                  Showing <span className="font-semibold">{displayedPosts.length}</span> of <span className="font-semibold">{filteredPosts.length}</span> articles.
                </p>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                {displayedPosts.map((post, index) => (
                  <BlogCard key={post._id} post={post} index={index} />
                ))}
              </section>

              {(displayLimit < filteredPosts.length || page < totalPages) && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {loadingMore ? 'Loading stories...' : 'Load more stories'}
                    {!loadingMore && <ArrowRight size={18} />}
                  </button>
                </div>
              )}
              {loadMoreError && (
                <div className="text-center text-sm text-rose-600" role="alert">
                  {loadMoreError}{' '}
                  <button type="button" onClick={loadMorePosts} className="font-semibold underline">
                    Try Again
                  </button>
                </div>
              )}

              {filteredPosts.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-white/20 dark:bg-black">
                  <Heart size={44} className="mx-auto text-rose-500 mb-4" />
                  <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">No articles found</h2>
                  <p className="mb-6 text-slate-500 dark:text-white/60">Try a different search term or explore another category.</p>
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
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/20 dark:bg-black">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp size={24} className="text-rose-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Trending now</h2>
                    <p className="text-sm text-slate-500 dark:text-white/60">Our most-read stories.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {trendingPosts.map((post, index) => (
                    <Link
                      key={post._id}
                      to={getBlogRoute(post.slug)}
                      className="block rounded-3xl border border-slate-100 p-4 transition hover:border-rose-200 hover:bg-rose-50 dark:border-white/10 dark:hover:border-rose-400/40 dark:hover:bg-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{post.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-white/60">{post.readTime} min read</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/20 dark:bg-black">
                <div className="flex items-center gap-3 mb-4">
                  <Mail size={24} className="text-rose-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Love advice in your inbox</h2>
                    <p className="text-sm text-slate-500 dark:text-white/60">Get weekly relationship tips and safety updates.</p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
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
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
