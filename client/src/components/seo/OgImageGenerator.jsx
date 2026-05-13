import React, { useEffect, useState } from 'react';

// ── Dynamic OG Image Generation System ────────────────────────────────────────

// 1. OG Image Generator Hook
export const useOgImage = () => {
  const [ogImageUrl, setOgImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateOgImage = async (type, params) => {
    setLoading(true);
    try {
      const response = await fetch('/api/og/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...params })
      });

      if (!response.ok) throw new Error('Failed to generate OG image');

      const data = await response.json();
      setOgImageUrl(data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error('OG Image generation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { ogImageUrl, loading, generateOgImage };
};

// 2. Blog Post OG Image Component
export const BlogOgImage = ({ post, onImageGenerated }) => {
  const { generateOgImage, ogImageUrl, loading } = useOgImage();

  useEffect(() => {
    const generate = async () => {
      const imageUrl = await generateOgImage('blog', {
        title: post.title,
        excerpt: post.description,
        author: post.author?.name || 'Elovia Love',
        category: post.category,
        readTime: post.readingTime,
        publishedAt: post.publishedAt
      });

      if (imageUrl && onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    };

    if (post.title && !ogImageUrl) {
      generate();
    }
  }, [post, generateOgImage, ogImageUrl, onImageGenerated]);

  return loading ? (
    <div className="og-image-preview">
      <div className="animate-pulse bg-gray-200 h-32 w-full rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Generating OG Image...</span>
      </div>
    </div>
  ) : ogImageUrl ? (
    <div className="og-image-preview">
      <img src={ogImageUrl} alt="OG Image Preview" className="rounded-lg shadow-md" />
    </div>
  ) : null;
};

// 3. City Page OG Image Component
export const CityOgImage = ({ city, stats }) => {
  const { generateOgImage, ogImageUrl, loading } = useOgImage();

  useEffect(() => {
    const generate = async () => {
      await generateOgImage('city', {
        cityName: city.name,
        region: city.region,
        activeUsers: stats?.activeUsers || 0,
        tagline: `Find Love in ${city.name}`
      });
    };

    if (city.name && !ogImageUrl) {
      generate();
    }
  }, [city, stats, generateOgImage, ogImageUrl]);

  return ogImageUrl || `${window.location.origin}/og/city-default.jpg`;
};

// 4. Quote Card OG Image Component
export const QuoteOgImage = ({ quote, author, category }) => {
  const { generateOgImage, ogImageUrl } = useOgImage();

  useEffect(() => {
    const generate = async () => {
      await generateOgImage('quote', {
        quote: quote,
        author: author,
        category: category || 'Dating Advice',
        backgroundColor: '#FF6B9D',
        textColor: '#FFFFFF'
      });
    };

    if (quote && author && !ogImageUrl) {
      generate();
    }
  }, [quote, author, category, generateOgImage, ogImageUrl]);

  return ogImageUrl;
};

// 5. Feature Page OG Image Component
export const FeatureOgImage = ({ feature, benefits }) => {
  const { generateOgImage, ogImageUrl } = useOgImage();

  useEffect(() => {
    const generate = async () => {
      await generateOgImage('feature', {
        title: feature.name,
        description: feature.description,
        benefits: benefits || [],
        icon: feature.icon || '❤️'
      });
    };

    if (feature.name && !ogImageUrl) {
      generate();
    }
  }, [feature, benefits, generateOgImage, ogImageUrl]);

  return ogImageUrl || `${window.location.origin}/og/feature-default.jpg`;
};

// ── Server-side OG Image Generation API (Node.js/Express) ────────────────────
/*
const express = require('express');
const router = express.Router();
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// Register fonts (you'll need to provide font files)
registerFont(path.join(__dirname, 'fonts/Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts/Inter-Regular.ttf'), { family: 'Inter', weight: 'normal' });

const generateOgImage = async (type, params) => {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Load background
  const background = await loadImage(path.join(__dirname, 'templates/og-background.jpg'));
  ctx.drawImage(background, 0, 0, 1200, 630);

  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, 'rgba(255, 107, 157, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 203, 107, 0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add text based on type
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';

  if (type === 'blog') {
    // Blog post OG image
    ctx.font = 'bold 48px Inter';
    const titleLines = wrapText(ctx, params.title, 1000);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, 600, 200 + (index * 60));
    });

    ctx.font = '24px Inter';
    ctx.fillText(`By ${params.author} • ${params.readTime} min read`, 600, 400);

    ctx.font = '18px Inter';
    ctx.fillText(params.category.toUpperCase(), 600, 450);
  }

  else if (type === 'city') {
    // City page OG image
    ctx.font = 'bold 56px Inter';
    ctx.fillText(`Find Love in`, 600, 200);

    ctx.font = 'bold 72px Inter';
    ctx.fillText(params.cityName, 600, 280);

    ctx.font = '24px Inter';
    ctx.fillText(`${params.activeUsers}+ Active Members`, 600, 380);
    ctx.fillText(params.region, 600, 420);
  }

  else if (type === 'quote') {
    // Quote card OG image
    ctx.font = 'bold 36px Inter';
    const quoteLines = wrapText(ctx, `"${params.quote}"`, 900);
    quoteLines.forEach((line, index) => {
      ctx.fillText(line, 600, 200 + (index * 50));
    });

    ctx.font = '24px Inter';
    ctx.fillText(`- ${params.author}`, 600, 400);
  }

  return canvas.toBuffer('image/png');
};

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

// API endpoint
router.post('/generate', async (req, res) => {
  try {
    const { type, ...params } = req.body;
    const imageBuffer = await generateOgImage(type, params);

    // Save to file or cloud storage (S3, Cloudinary, etc.)
    const filename = `og-${type}-${Date.now()}.png`;
    const imageUrl = await saveImageToStorage(imageBuffer, filename);

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('OG Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate OG image' });
  }
});

module.exports = router;
*/

// ── Usage Examples ───────────────────────────────────────────────────────────

// Blog Post Usage:
/*
import { BlogOgImage } from './components/seo/OgImageGenerator';

const BlogPostPage = ({ post }) => {
  const [ogImage, setOgImage] = useState(null);

  return (
    <div>
      <BlogOgImage
        post={post}
        onImageGenerated={setOgImage}
      />

      {ogImage && (
        <Helmet>
          <meta property="og:image" content={ogImage} />
        </Helmet>
      )}

      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
};
*/

// City Page Usage:
/*
import { CityOgImage } from './components/seo/OgImageGenerator';

const CityPage = ({ city }) => {
  const ogImage = CityOgImage({ city, stats: { activeUsers: 1250 } });

  return (
    <div>
      <Helmet>
        <meta property="og:image" content={ogImage} />
      </Helmet>

      <h1>Dating in {city.name}</h1>
      <p>Find your perfect match in {city.name}</p>
    </div>
  );
};
*/

export {
  useOgImage,
  BlogOgImage,
  CityOgImage,
  QuoteOgImage,
  FeatureOgImage
};