import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Eye, Heart } from 'lucide-react';
import { getBlogPostBySlug, getRelatedPosts } from '../data/blogData';

const BlogPost = () => {
  const { slug } = useParams();
  const post = useMemo(() => getBlogPostBySlug(slug), [slug]);
  const relatedPosts = useMemo(() => (post ? getRelatedPosts(slug) : []), [post, slug]);

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Post Not Found | Elovia Love Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
          <div className="max-w-xl text-center">
            <Heart size={56} className="text-rose-200 mx-auto mb-5" />
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Post not found</h1>
            <p className="text-slate-500 mb-6">The article you are looking for is not available or may have been removed.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = `${post.title} | Elovia Love`;
  const pageDescription = post.metaDescription || post.excerpt;
  const pageUrl = `https://elovialove.onrender.com/blog/${post.slug}`;

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
        <meta property="og:image" content={post.featuredImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={post.featuredImage} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700">
                {post.category}
              </span>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye size={14} />
                  {post.views.toLocaleString()} views
                </span>
              </div>
            </div>

            {post.featuredImage && (
              <div className="overflow-hidden rounded-4xl bg-slate-100 shadow-lg">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-slate prose-lg max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {relatedPosts.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Related articles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related._id}
                      to={`/blog/${related.slug}`}
                      className="rounded-3xl border border-slate-100 p-5 hover:border-rose-200 hover:bg-rose-50 transition"
                    >
                      <h3 className="font-semibold text-slate-900 mb-2">{related.title}</h3>
                      <p className="text-sm text-slate-500">{related.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
