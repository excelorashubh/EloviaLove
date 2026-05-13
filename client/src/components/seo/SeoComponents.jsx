import React from 'react';
import { Helmet } from 'react-helmet-async';

// ── Core SEO Component System ──────────────────────────────────────────────────

// 1. Base SEO Wrapper - Handles all common metadata
export const SeoWrapper = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false,
  children
}) => {
  const siteUrl = 'https://elovialove.onrender.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : `${siteUrl}${window.location.pathname}`;
  const fullOgImage = ogImage ? `${siteUrl}${ogImage}` : `${siteUrl}/og-default.jpg`;

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={fullCanonical} />

        {/* Robots */}
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullOgImage} />
        <meta property="og:url" content={fullCanonical} />
        <meta property="og:type" content={ogType} />
        <meta property="og:site_name" content="Elovia Love" />

        {/* Twitter Card */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullOgImage} />

        {/* Additional SEO Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en-US" />
      </Helmet>

      {/* Structured Data */}
      {structuredData && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
      )}

      {children}
    </>
  );
};

// 2. Blog Post SEO Component
export const BlogPostSeo = ({
  post,
  author,
  publishedTime,
  modifiedTime,
  categories,
  tags,
  wordCount,
  readingTime
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.ogImage || `${window.location.origin}/og-default.jpg`,
    "author": {
      "@type": "Person",
      "name": author.name,
      "url": `${window.location.origin}/author/${author.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Elovia Love",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "articleSection": categories?.[0] || "Dating Tips",
    "keywords": tags?.join(", "),
    "wordCount": wordCount,
    "timeRequired": `PT${readingTime}M`,
    "isAccessibleForFree": true
  };

  return (
    <SeoWrapper
      title={`${post.title} | Elovia Love Dating Blog`}
      description={post.description}
      canonical={`/blog/${post.slug}`}
      ogImage={post.ogImage}
      ogType="article"
      structuredData={structuredData}
    />
  );
};

// 3. City Page SEO Component
export const CityPageSeo = ({ city, stats, features }) => {
  const title = `Find Love in ${city.name} | Dating in ${city.name} | Elovia Love`;
  const description = `Meet singles in ${city.name}. ${stats.activeUsers}+ active members. Safe, verified dating for serious relationships in ${city.name}. Join ${city.name}'s trusted dating community.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": window.location.href,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Elovia Love",
      "url": "https://elovialove.onrender.com"
    },
    "about": {
      "@type": "Place",
      "name": city.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.name,
        "addressCountry": "IN"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `Dating in ${city.name}`,
      "description": `Find love and serious relationships in ${city.name}`
    }
  };

  return (
    <SeoWrapper
      title={title}
      description={description}
      canonical={`/dating-in-${city.slug}`}
      ogImage={`/og/city-${city.slug}.jpg`}
      structuredData={structuredData}
    />
  );
};

// 4. Trust/Safety Page SEO Component
export const TrustPageSeo = ({ pageData, lastUpdated }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageData.title,
    "description": pageData.description,
    "url": window.location.href,
    "dateModified": lastUpdated,
    "publisher": {
      "@type": "Organization",
      "name": "Elovia Love",
      "url": "https://elovialove.onrender.com",
      "sameAs": [
        "https://www.facebook.com/elovialove",
        "https://www.instagram.com/elovialove"
      ]
    }
  };

  return (
    <SeoWrapper
      title={`${pageData.title} | Elovia Love`}
      description={pageData.description}
      canonical={`/${pageData.slug}`}
      structuredData={structuredData}
    />
  );
};

// 5. NoIndex Wrapper for Private Pages
export const NoIndexWrapper = ({ children }) => (
  <SeoWrapper noindex={true}>
    {children}
  </SeoWrapper>
);

// ── Dynamic OG Image Generation Hook ──────────────────────────────────────────
export const useOgImage = () => {
  const generateOgImage = async (type, params) => {
    // Call your OG image generation API
    const response = await fetch('/api/og/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...params })
    });
    return response.json();
  };

  return { generateOgImage };
};

// ── Usage Examples ───────────────────────────────────────────────────────────

// Blog Post Usage:
/*
import { BlogPostSeo } from './components/seo/SeoComponents';

const BlogPostPage = ({ post }) => (
  <BlogPostSeo
    post={post}
    author={post.author}
    publishedTime={post.publishedAt}
    modifiedTime={post.updatedAt}
    categories={post.categories}
    tags={post.tags}
    wordCount={post.wordCount}
    readingTime={post.readingTime}
  >
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  </BlogPostSeo>
);
*/

// City Page Usage:
/*
import { CityPageSeo } from './components/seo/SeoComponents';

const CityPage = ({ city }) => (
  <CityPageSeo
    city={city}
    stats={{ activeUsers: 1250 }}
    features={['Verified Profiles', 'Safe Dating', 'Serious Relationships']}
  >
    <div className="city-page">
      <h1>Dating in {city.name}</h1>
      <p>Find your perfect match in {city.name}</p>
    </div>
  </CityPageSeo>
);
*/

// Private Page Usage:
/*
import { NoIndexWrapper } from './components/seo/SeoComponents';

const UserProfile = () => (
  <NoIndexWrapper>
    <div className="profile">
      <h1>User Profile</h1>
      <p>Private user information</p>
    </div>
  </NoIndexWrapper>
);
*/

export default {
  SeoWrapper,
  BlogPostSeo,
  CityPageSeo,
  TrustPageSeo,
  NoIndexWrapper,
  useOgImage
};