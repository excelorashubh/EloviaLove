import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Eye, Loader2, Heart } from 'lucide-react';
import api from '../services/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Blog] Fetching posts...');
        
        const res = await api.get('/blog?page=1&limit=12');
        console.log('[Blog] API Response:', res.data);
        
        const data = Array.isArray(res.data?.posts) ? res.data.posts : [];
        setPosts(data);
      } catch (err) {
        console.error('[Blog] Fetch error:', err);
        setError(err.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Love & Relationship Blog | Elovia Love</title>
        <meta
          name="description"
          content="Explore love and relationship advice on Elovia Love. Find dating tips, communication guides, and confidence-building stories for modern Indian singles."
        />
        <link rel="canonical" href="https://elovialove.onrender.com/blog" />
        <meta property="og:title" content="Love & Relationship Blog | Elovia Love" />
        <meta property="og:description" content="Relationship advice, dating tips, and love stories from Elovia Love." />
        <meta property="og:url" content="https://elovialove.onrender.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-pink-600 to-rose-500 text-white pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
              💕 Love & Relationship Advice
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Love & Relationship Advice Blog
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Real talk on love, dating, heartbreak & self-growth — for the modern Indian heart.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
              <p className="text-slate-500">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Heart size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">Unable to load posts</p>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">No blog posts yet</p>
              <p className="text-slate-400 text-sm mt-2">Check back soon for relationship advice and dating tips!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Link
                  key={post._id || post.slug || index}
                  to={post.slug ? `/blog/${post.slug}` : '/blog'}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Featured Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-pink-100 overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title || 'Blog post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart size={40} className="text-primary-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title || 'Untitled Post'}
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                      {post.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {post.views}
                        </span>
                      )}
                    </div>

                    {/* Read More */}
                    <div className="mt-4 text-primary-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
