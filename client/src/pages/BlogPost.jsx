import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, Eye, Heart } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import api from '../services/api';
import { getBlogImageUrl, getBlogRoute, normalizeBlogPost } from '../utils/blog';

const formatPublishedDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'Recently published';
};

const BlogPost = () => {
  const { slug = '' } = useParams();
  const [result, setResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const requestedSlug = slug.trim();

    api.get(`/blogs/${encodeURIComponent(requestedSlug)}`)
      .then(({ data }) => {
        if (!data?.post || typeof data.post !== 'object' || !data.post.slug) {
          throw new Error('Unexpected blog response structure');
        }
        if (!isCurrent) return;

        const post = normalizeBlogPost(data.post);
        const relatedPosts = Array.isArray(data.related)
          ? data.related.map(normalizeBlogPost).filter((related) => (
            related?.slug && related.slug !== post.slug
          ))
          : [];
        setImageFailed(false);
        setResult({ requestedSlug: slug, post, relatedPosts });
      })
      .catch((error) => {
        console.error('Unable to load blog post:', error);
        if (isCurrent) {
          setResult({
            requestedSlug: slug,
            error: error.response?.status === 404 ? 'not_found' : 'load_error',
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [slug, retryCount]);

  const currentResult = result?.requestedSlug === slug ? result : null;
  const post = currentResult?.post;
  const relatedPosts = currentResult?.relatedPosts || [];
  const error = currentResult?.error;
  const loading = !currentResult;

  const contentHtml = useMemo(() => {
    if (!post || typeof post.content !== 'string') return '';
    const rawContent = post.content;
    const hasHtmlMarkup = /<\/?[a-z][\s\S]*?>/i.test(rawContent);
    if (hasHtmlMarkup) return DOMPurify.sanitize(rawContent);

    return rawContent
      .split(/\n\s*\n/)
      .map((paragraph) => `<p>${DOMPurify.sanitize(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }, [post]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-24 dark:bg-black">
        <div className="w-full max-w-4xl animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-white/20" />
          <div className="h-12 w-4/5 rounded bg-slate-200 dark:bg-white/20" />
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-white/20" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-slate-100 dark:bg-white/10" />
            <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    const notFound = error === 'not_found';
    return (
      <>
        <Helmet>
          <title>{notFound ? 'Post Not Found | Elovia Love Blog' : 'Unable to Load Story | Elovia Love Blog'}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-24 dark:bg-black">
          <div className="max-w-xl text-center">
            <Heart size={56} className="mx-auto mb-5 text-rose-300" />
            <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">
              {notFound ? 'Post not found' : 'Unable to load this story.'}
            </h1>
            <p className="mb-6 text-slate-500 dark:text-white/60">
              {notFound
                ? 'The article you are looking for is not available or may have been removed.'
                : 'Please check your connection and try again.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {!notFound && (
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Try Again
                </button>
              )}
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = `${post.metaTitle || post.title} | Elovia Love`;
  const plainContent = typeof post.content === 'string'
    ? post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const pageDescription = post.metaDescription || post.excerpt || plainContent.slice(0, 160);
  const pageUrl = `${SITE_URL}${getBlogRoute(post.slug)}`;
  const imageUrl = getBlogImageUrl(post.featuredImage);
  const socialImageUrl = imageUrl && !/^(?:data:|blob:)/i.test(imageUrl) ? imageUrl : '';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        {socialImageUrl && <meta property="og:image" content={socialImageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {socialImageUrl && <meta name="twitter:image" content={socialImageUrl} />}
      </Helmet>

      <article className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-rose-600 dark:text-white/70 dark:hover:text-rose-300"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <header className="mt-8 space-y-5">
            {post.category && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-white/60">
              <span>By {post.author}</span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} />
                {formatPublishedDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={14} />
                {post.readTime} min read
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye size={14} />
                {post.views.toLocaleString()} views
              </span>
            </div>
          </header>

          {imageUrl && (
            <div className="mt-8 flex min-h-48 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 dark:bg-white/10 sm:min-h-72">
              {!imageFailed ? (
                <img
                  src={imageUrl}
                  alt={post.title}
                  onError={() => setImageFailed(true)}
                  className="max-h-[32rem] w-full object-cover"
                />
              ) : (
                <Heart size={48} className="text-rose-300" />
              )}
            </div>
          )}

          <div
            className="prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white/80"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Article tags">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {relatedPosts.length > 0 && (
            <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/20 dark:bg-black sm:p-8">
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Related articles</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related._id || related.slug}
                    to={getBlogRoute(related.slug)}
                    className="rounded-2xl border border-slate-100 p-5 transition hover:border-rose-200 hover:bg-rose-50 dark:border-white/10 dark:hover:border-rose-400/40 dark:hover:bg-white/5"
                  >
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{related.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-white/60">{related.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogPost;
