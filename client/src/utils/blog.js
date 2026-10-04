const getCategoryFromTags = (tags) => {
  const normalizedTags = tags.join(' ').toLowerCase();
  if (normalizedTags.includes('relationship')) return 'Relationship Tips';
  if (normalizedTags.includes('healing')) return 'Emotional Healing';
  if (normalizedTags.includes('self love') || normalizedTags.includes('self-love')) return 'Self Love';
  if (normalizedTags.includes('marriage')) return 'Marriage Advice';
  return 'Dating Advice';
};

export const normalizeBlogPost = (post) => {
  if (!post || typeof post !== 'object') return null;

  const tags = Array.isArray(post.tags) ? post.tags.filter((tag) => typeof tag === 'string') : [];
  const contentText = typeof post.content === 'string'
    ? post.content.replace(/<[^>]*>/g, ' ')
    : '';
  const wordCount = contentText.trim().split(/\s+/).filter(Boolean).length;

  return {
    ...post,
    title: typeof post.title === 'string' ? post.title : '',
    excerpt: typeof post.excerpt === 'string' ? post.excerpt : '',
    author: typeof post.author === 'string' && post.author ? post.author : 'Elovia Love Team',
    category: typeof post.category === 'string' && post.category
      ? post.category
      : getCategoryFromTags(tags),
    tags,
    views: Number.isFinite(Number(post.views)) ? Number(post.views) : 0,
    readTime: Number(post.readingTime ?? post.readTime) || Math.max(1, Math.ceil(wordCount / 200)),
  };
};

export const getBlogImageUrl = (imagePath) => {
  if (typeof imagePath !== 'string' || !imagePath.trim()) return '';

  const image = imagePath.trim();
  if (/^(?:data:|blob:|https?:\/\/|\/\/)/i.test(image)) return image;

  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const configuredOrigin = configuredApiUrl.replace(/\/api$/i, '');
  const imagePathFromRoot = `/${image.replace(/^\/+/, '')}`;

  if (/^https?:\/\//i.test(configuredOrigin)) {
    return new URL(imagePathFromRoot, `${configuredOrigin}/`).toString();
  }

  if (typeof window !== 'undefined') {
    return new URL(imagePathFromRoot, window.location.origin).toString();
  }

  return imagePathFromRoot;
};

export const getBlogRoute = (slug) => (
  typeof slug === 'string' && slug.trim()
    ? `/blog/${encodeURIComponent(slug.trim())}`
    : '/blog'
);
