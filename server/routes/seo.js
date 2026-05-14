const Blog = require('../models/Blog');

/**
 * Generates the complete unified XML sitemap
 */
const generateSitemap = async (baseUrl) => {
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const routes = [
    // Core Pages
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/pricing', priority: 0.7, changefreq: 'weekly' },
    { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
    { url: '/terms', priority: 0.5, changefreq: 'yearly' },
    { url: '/faq', priority: 0.7, changefreq: 'weekly' },
    { url: '/help', priority: 0.7, changefreq: 'weekly' },

    // Safety Hub
    { url: '/safety', priority: 0.9, changefreq: 'monthly' },
    { url: '/dating-safety', priority: 0.9, changefreq: 'monthly' },
    { url: '/how-verification-works', priority: 0.9, changefreq: 'monthly' },
    { url: '/online-dating-safety-india', priority: 0.9, changefreq: 'monthly' },
    { url: '/report-abuse', priority: 0.8, changefreq: 'monthly' },
    { url: '/community-guidelines', priority: 0.8, changefreq: 'monthly' },
    { url: '/safe-first-date-tips', priority: 0.9, changefreq: 'monthly' },

    // Cities
    ...['delhi', 'mumbai', 'bangalore', 'kolkata', 'ranchi', 'chennai', 'hyderabad', 'pune', 'ahmedabad'].map(c => ({
      url: `/dating-in-${c}`, priority: 0.8, changefreq: 'weekly'
    })),

    // Guides & Features
    ...['dating-tips', 'safety', 'relationships', 'profile-optimization'].map(g => ({
      url: `/guides/${g}`, priority: 0.7, changefreq: 'monthly'
    })),
    { url: '/private-chat', priority: 0.7, changefreq: 'monthly' },
    { url: '/video-chat', priority: 0.7, changefreq: 'monthly' },
    { url: '/relationship-matching', priority: 0.8, changefreq: 'monthly' },
    { url: '/verified-profiles', priority: 0.9, changefreq: 'monthly' },

    // Blog Hub
    { url: '/blog', priority: 0.8, changefreq: 'daily' },
  ];

  // Static Blog Slugs
  const staticBlogSlugs = [
    'dating-profile-tips', 'online-dating-safety', 'first-message-examples', 'how-to-find-real-love',
    'red-flags-in-online-dating', 'long-distance-relationship-advice', 'how-to-avoid-fake-profiles',
    'best-dating-app-tips', 'how-to-start-a-conversation', 'how-to-build-trust-online',
    'relationship-red-flags', 'safe-first-date-tips'
  ];

  const blogRoutes = staticBlogSlugs.map(slug => ({
    url: `/blog/${slug}`, priority: 0.7, changefreq: 'monthly'
  }));

  // Dynamic DB Blogs
  const dbBlogs = await Blog.find({ isPublished: true }).select('slug updatedAt').lean();
  dbBlogs.forEach(blog => {
    if (!staticBlogSlugs.includes(blog.slug)) {
      blogRoutes.push({
        url: `/blog/${blog.slug}`,
        lastmod: blog.updatedAt.toISOString().split('T')[0],
        priority: 0.7,
        changefreq: 'monthly'
      });
    }
  });

  // Compile XML
  [...routes, ...blogRoutes].forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

const sitemapHandler = async (req, res) => {
  try {
    const baseUrl = 'https://elovialove.onrender.com';
    const xml = await generateSitemap(baseUrl);
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error');
  }
};

module.exports = { sitemapHandler };