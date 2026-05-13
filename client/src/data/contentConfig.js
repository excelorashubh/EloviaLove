// ── Content Database Architecture ──────────────────────────────────────────────
// Scalable blog/content management system for dating platform SEO

// 1. Content Configuration - Central hub for all content metadata
export const CONTENT_CONFIG = {
  site: {
    name: 'Elovia Love',
    url: 'https://elovialove.onrender.com',
    description: 'Safe, verified dating platform for serious relationships in India',
    author: 'Elovia Love Team',
    language: 'en-US',
    ogImage: '/og-default.jpg'
  },

  categories: {
    'dating-tips': {
      name: 'Dating Tips',
      description: 'Expert advice for successful dating and relationships',
      priority: 0.8,
      changefreq: 'weekly'
    },
    'relationship-advice': {
      name: 'Relationship Advice',
      description: 'Guidance for building healthy, lasting relationships',
      priority: 0.8,
      changefreq: 'weekly'
    },
    'safety-tips': {
      name: 'Safety Tips',
      description: 'Stay safe while dating online',
      priority: 0.9,
      changefreq: 'monthly'
    },
    'success-stories': {
      name: 'Success Stories',
      description: 'Real stories from happy couples who found love',
      priority: 0.7,
      changefreq: 'monthly'
    }
  },

  cities: {
    delhi: { name: 'Delhi', region: 'North India', population: '32M', priority: 0.9 },
    mumbai: { name: 'Mumbai', region: 'West India', population: '21M', priority: 0.9 },
    bangalore: { name: 'Bangalore', region: 'South India', population: '15M', priority: 0.8 },
    kolkata: { name: 'Kolkata', region: 'East India', population: '15M', priority: 0.8 },
    chennai: { name: 'Chennai', region: 'South India', population: '12M', priority: 0.8 },
    hyderabad: { name: 'Hyderabad', region: 'South India', population: '11M', priority: 0.8 },
    pune: { name: 'Pune', region: 'West India', population: '7M', priority: 0.7 },
    ahmedabad: { name: 'Ahmedabad', region: 'West India', population: '8M', priority: 0.7 },
    jaipur: { name: 'Jaipur', region: 'North India', population: '4M', priority: 0.7 },
    lucknow: { name: 'Lucknow', region: 'North India', population: '4M', priority: 0.7 }
  },

  features: {
    'verified-profiles': {
      name: 'Verified Profiles',
      description: '100% verified dating profiles for authentic connections',
      priority: 0.9
    },
    'private-chat': {
      name: 'Private Chat',
      description: 'Secure, private messaging for meaningful conversations',
      priority: 0.8
    },
    'video-chat': {
      name: 'Video Chat',
      description: 'Face-to-face video calls to build real connections',
      priority: 0.8
    },
    'safe-dating': {
      name: 'Safe Dating',
      description: 'Advanced safety features for secure online dating',
      priority: 0.9
    },
    'serious-relationships': {
      name: 'Serious Relationships',
      description: 'Find meaningful, long-term relationships',
      priority: 0.8
    }
  }
};

// 2. Slug Management System
export class SlugManager {
  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  static validateSlug(slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  static ensureUnique(slug, existingSlugs) {
    if (!existingSlugs.includes(slug)) return slug;

    let counter = 1;
    let uniqueSlug = `${slug}-${counter}`;
    while (existingSlugs.includes(uniqueSlug)) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
    return uniqueSlug;
  }
}

// 3. Content Metadata Manager
export class ContentMetadataManager {
  static generateBlogMetadata(post, category) {
    const baseUrl = CONTENT_CONFIG.site.url;
    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

    return {
      title: `${post.title} | ${CONTENT_CONFIG.site.name}`,
      description: post.description,
      canonical: canonicalUrl,
      ogImage: post.ogImage || `${baseUrl}/og/blog-${post.slug}.jpg`,
      keywords: post.tags?.join(', '),
      category: category.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      author: post.author || CONTENT_CONFIG.site.author,
      wordCount: post.wordCount,
      readingTime: Math.ceil(post.wordCount / 200), // Assume 200 words per minute
      priority: category.priority,
      changefreq: category.changefreq
    };
  }

  static generateCityMetadata(city) {
    const baseUrl = CONTENT_CONFIG.site.url;
    const cityData = CONTENT_CONFIG.cities[city.slug];

    return {
      title: `Find Love in ${cityData.name} | Dating in ${cityData.name} | ${CONTENT_CONFIG.site.name}`,
      description: `Meet verified singles in ${cityData.name}. Safe, serious dating for meaningful relationships. Join ${cityData.name}'s trusted dating community.`,
      canonical: `${baseUrl}/dating-in-${city.slug}`,
      ogImage: `${baseUrl}/og/city-${city.slug}.jpg`,
      keywords: `dating ${cityData.name}, singles ${cityData.name}, find love ${cityData.name}, relationships ${cityData.name}`,
      priority: cityData.priority,
      changefreq: 'weekly'
    };
  }

  static generateFeatureMetadata(feature) {
    const baseUrl = CONTENT_CONFIG.site.url;
    const featureData = CONTENT_CONFIG.features[feature.slug];

    return {
      title: `${featureData.name} | ${CONTENT_CONFIG.site.name}`,
      description: featureData.description,
      canonical: `${baseUrl}/${feature.slug}`,
      ogImage: `${baseUrl}/og/feature-${feature.slug}.jpg`,
      keywords: `${feature.slug.replace('-', ' ')}, ${CONTENT_CONFIG.site.name}`,
      priority: featureData.priority,
      changefreq: 'monthly'
    };
  }
}

// 4. Related Posts Engine
export class RelatedPostsEngine {
  static findRelatedPosts(currentPost, allPosts, limit = 5) {
    const related = allPosts
      .filter(post => post.slug !== currentPost.slug)
      .map(post => ({
        ...post,
        score: this.calculateRelevanceScore(currentPost, post)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return related;
  }

  static calculateRelevanceScore(post1, post2) {
    let score = 0;

    // Category match (highest weight)
    if (post1.category === post2.category) score += 50;

    // Tag overlap
    const commonTags = post1.tags?.filter(tag => post2.tags?.includes(tag)) || [];
    score += commonTags.length * 20;

    // Title keyword similarity
    const titleWords1 = post1.title.toLowerCase().split(' ');
    const titleWords2 = post2.title.toLowerCase().split(' ');
    const commonWords = titleWords1.filter(word => titleWords2.includes(word) && word.length > 3);
    score += commonWords.length * 10;

    // Recent posts get slight boost
    const daysSincePost1 = (Date.now() - new Date(post1.publishedAt)) / (1000 * 60 * 60 * 24);
    const daysSincePost2 = (Date.now() - new Date(post2.publishedAt)) / (1000 * 60 * 60 * 24);
    if (daysSincePost2 < daysSincePost1) score += 5;

    return score;
  }
}

// 5. Automatic Sitemap Integration
export class SitemapGenerator {
  static generateBlogSitemap(posts) {
    const baseUrl = CONTENT_CONFIG.site.url;

    return posts.map(post => {
      const category = CONTENT_CONFIG.categories[post.category];
      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updatedAt || post.publishedAt,
        changefreq: category?.changefreq || 'monthly',
        priority: category?.priority || 0.6
      };
    });
  }

  static generateCitySitemap() {
    const baseUrl = CONTENT_CONFIG.site.url;

    return Object.entries(CONTENT_CONFIG.cities).map(([slug, city]) => ({
      url: `${baseUrl}/dating-in-${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: city.priority
    }));
  }

  static generateFeatureSitemap() {
    const baseUrl = CONTENT_CONFIG.site.url;

    return Object.entries(CONTENT_CONFIG.features).map(([slug, feature]) => ({
      url: `${baseUrl}/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: feature.priority
    }));
  }

  static generateTrustSitemap(pages) {
    const baseUrl = CONTENT_CONFIG.site.url;

    return pages.map(page => ({
      url: `${baseUrl}/${page.slug}`,
      lastmod: page.updatedAt || new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8
    }));
  }
}

// ── Folder Structure Example ──────────────────────────────────────────────────
/*
client/src/
├── data/
│   ├── contentConfig.js          # This file - central content configuration
│   ├── seoContent.js             # Static SEO page content
│   └── blogContent.js            # Static blog posts
├── components/
│   ├── seo/
│   │   ├── SeoComponents.jsx     # SEO component system
│   │   ├── OgImageGenerator.jsx  # Dynamic OG image generation
│   │   └── StructuredData.jsx    # JSON-LD schema components
│   └── content/
│       ├── BlogCard.jsx          # Blog post preview component
│       ├── CityCard.jsx          # City landing page component
│       └── RelatedPosts.jsx      # Related posts component
├── pages/
│   ├── seo/
│   │   ├── CityPage.jsx          # Dynamic city page renderer
│   │   ├── FeaturePage.jsx       # Dynamic feature page renderer
│   │   └── TrustPage.jsx         # Dynamic trust page renderer
│   └── blog/
│       ├── BlogList.jsx          # Blog listing with categories
│       └── BlogPost.jsx          # Enhanced blog post page
└── services/
    ├── contentService.js         # Content API service
    └── sitemapService.js         # Sitemap generation service

server/
├── models/
│   ├── Blog.js                   # Blog post model
│   ├── City.js                   # City data model
│   └── ContentMetadata.js        # Content metadata model
├── routes/
│   ├── content.js                # Content management routes
│   ├── sitemap.js                # Enhanced sitemap routes
│   └── og.js                     # OG image generation routes
└── services/
    ├── contentManager.js         # Content management service
    └── ogGenerator.js            # OG image generation service
*/

// ── Usage Examples ───────────────────────────────────────────────────────────

// Generate blog metadata:
/*
import { ContentMetadataManager } from './data/contentConfig';

const blogMetadata = ContentMetadataManager.generateBlogMetadata(post, category);
// Returns: { title, description, canonical, ogImage, keywords, ... }
*/

// Find related posts:
/*
import { RelatedPostsEngine } from './data/contentConfig';

const relatedPosts = RelatedPostsEngine.findRelatedPosts(currentPost, allPosts, 5);
// Returns array of related posts sorted by relevance
*/

// Generate sitemap:
/*
import { SitemapGenerator } from './data/contentConfig';

const blogUrls = SitemapGenerator.generateBlogSitemap(posts);
const cityUrls = SitemapGenerator.generateCitySitemap();
const allUrls = [...blogUrls, ...cityUrls, ...featureUrls, ...trustUrls];
*/

export {
  CONTENT_CONFIG,
  SlugManager,
  ContentMetadataManager,
  RelatedPostsEngine,
  SitemapGenerator
};