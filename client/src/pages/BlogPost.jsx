import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Eye, Loader2, Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('No post slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[BlogPost] Fetching:', slug);
        
        const res = await api.get(`/blog/${slug}`);
        console.log('[BlogPost] API Response:', res.data);
        
        setPost(res.data?.post || null);
      } catch (err) {
        console.error('[BlogPost] Fetch error:', err);
        setError(err.response?.status === 404 ? 'Post not found' : err.message);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Elovia Love Blog</title>
        </Helmet>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading article...</p>
          </div>
        </div>
      </>
    );
  }

  // Error/Not Found state
  if (error || !post) {
    return (
      <>
        <Helmet>
          <title>Post Not Found | Elovia Love Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="max-w-2xl mx-auto px-4 py-32 text-center">
            <Heart size={56} className="text-slate-200 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Post not found</h1>
            <p className="text-slate-500 mb-6">{error || 'This article may have been moved or deleted.'}</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Success state - render post
  const pageTitle = `${post.title} | Elovia Love Blog`;
  const pageDescription = post.excerpt || post.metaDescription || post.title;
  const pageUrl = `https://elovialove.onrender.com/blog/${slug}`;
  const pageImage = post.featuredImage || 'https://elovialove.onrender.com/EloviaLoveWB_small.png';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={pageImage} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="w-full bg-slate-100" style={{ aspectRatio: '4 / 1' }}>
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> All Articles
          </button>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-6 border-b border-slate-200">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {post.author[0]?.toUpperCase()}
                </div>
                <span className="text-slate-700 font-medium">{post.author}</span>
              </div>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
            {post.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye size={13} />
                {post.views} views
              </span>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900
              prose-img:rounded-2xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary-600 to-pink-600 rounded-3xl p-8 text-white text-center">
            <Heart size={36} className="mx-auto mb-3 fill-white/30" />
            <h3 className="text-2xl font-extrabold mb-2">Ready to Find Your Person?</h3>
            <p className="text-white/80 mb-5 text-sm max-w-sm mx-auto">
              Join thousands of Indians finding real love on Elovia Love.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-colors text-sm"
            >
              Join Elovia Love Free →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
