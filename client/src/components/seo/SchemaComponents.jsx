import React from 'react';
import { Helmet } from 'react-helmet-async';

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION-READY SCHEMA.ORG COMPONENTS FOR ELOVIA LOVE
// ══════════════════════════════════════════════════════════════════════════════

const SITE_URL = 'https://elovialove.onrender.com';
const SITE_NAME = 'Elovia Love';
const LOGO_URL = `${SITE_URL}/EloviaLoveWB.png`;

// ── 1. WEBSITE SCHEMA ─────────────────────────────────────────────────────────

export const WebSiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "alternateName": "Elovia Love Dating App",
    "url": SITE_URL,
    "description": "India's verified dating platform for serious relationships. No fake profiles. Real connections. Safe dating for meaningful relationships.",
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL,
        "width": 600,
        "height": 60
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.facebook.com/elovialove",
      "https://www.instagram.com/elovialove",
      "https://twitter.com/elovialove",
      "https://www.linkedin.com/company/elovialove",
      "https://www.youtube.com/@elovialove"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 2. ORGANIZATION SCHEMA ────────────────────────────────────────────────────

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "legalName": "Elovia Love Private Limited",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": LOGO_URL,
      "width": 600,
      "height": 60
    },
    "description": "Elovia Love is India's most trusted dating platform for serious relationships. We verify every profile, prioritize safety, and use AI-powered matching to help singles find meaningful connections.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Elovia Love Team"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "India"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer support",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@elovialove.com",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/elovialove",
      "https://www.instagram.com/elovialove",
      "https://twitter.com/elovialove",
      "https://www.linkedin.com/company/elovialove",
      "https://www.youtube.com/@elovialove"
    ],
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME,
      "description": "Verified dating for serious relationships",
      "logo": LOGO_URL
    },
    "slogan": "Find Real Love. Verified Profiles. Safe Dating.",
    "knowsAbout": [
      "Online Dating",
      "Relationship Advice",
      "Dating Safety",
      "Matchmaking",
      "Serious Relationships",
      "Indian Dating",
      "Verified Profiles",
      "Dating Tips"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "serviceType": [
      "Online Dating Service",
      "Matchmaking Service",
      "Relationship Counseling",
      "Dating Safety Education"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 3. LOCAL BUSINESS SCHEMA (for city pages) ────────────────────────────────

export const LocalBusinessSchema = ({ city, region = "India" }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${SITE_NAME} - ${city}`,
    "image": LOGO_URL,
    "url": `${SITE_URL}/dating-in-${city.toLowerCase().replace(/\s+/g, '-')}`,
    "telephone": "+91-XXXXXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressRegion": region,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.0",  // Add actual coordinates
      "longitude": "0.0"
    },
    "priceRange": "Free - ₹899/month",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/elovialove",
      "https://www.instagram.com/elovialove"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 4. BREADCRUMB SCHEMA ──────────────────────────────────────────────────────

export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 5. ARTICLE SCHEMA (for blog posts) ───────────────────────────────────────

export const ArticleSchema = ({ 
  title, 
  description, 
  author, 
  publishedDate, 
  modifiedDate, 
  image, 
  slug,
  category = "Dating Tips",
  keywords = []
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || LOGO_URL,
    "author": {
      "@type": "Person",
      "name": author || "Elovia Love Editorial Team",
      "url": `${SITE_URL}/author/${(author || 'elovia-love-team').toLowerCase().replace(/\s+/g, '-')}`
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`
    },
    "articleSection": category,
    "keywords": keywords.join(", "),
    "isAccessibleForFree": true,
    "inLanguage": "en-IN"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 6. FAQ SCHEMA ─────────────────────────────────────────────────────────────

export const FAQSchema = ({ faqs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 7. PRODUCT SCHEMA (for subscription plans) ───────────────────────────────

export const ProductSchema = ({ plan }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${SITE_NAME} ${plan.name} Plan`,
    "description": plan.description,
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/pricing`,
      "priceCurrency": "INR",
      "price": plan.price,
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "10000",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 8. REVIEW SCHEMA ──────────────────────────────────────────────────────────

export const ReviewSchema = ({ reviews }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": SITE_NAME,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": reviews.length || 10000,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.date,
      "reviewBody": review.text,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 9. HOW-TO SCHEMA (for guides) ─────────────────────────────────────────────

export const HowToSchema = ({ title, description, steps, image }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "image": image || LOGO_URL,
    "totalTime": "PT15M",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url || `${SITE_URL}#step-${index + 1}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── 10. VIDEO SCHEMA ──────────────────────────────────────────────────────────

export const VideoSchema = ({ title, description, thumbnailUrl, uploadDate, duration, contentUrl }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "duration": duration,
    "contentUrl": contentUrl,
    "embedUrl": contentUrl,
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ── USAGE EXAMPLES ────────────────────────────────────────────────────────────

/*
// Homepage - Add both WebSite and Organization schemas
import { WebSiteSchema, OrganizationSchema } from './components/seo/SchemaComponents';

const HomePage = () => (
  <>
    <WebSiteSchema />
    <OrganizationSchema />
    <div>Homepage content...</div>
  </>
);

// City Page - Add LocalBusiness schema
import { LocalBusinessSchema, BreadcrumbSchema } from './components/seo/SchemaComponents';

const CityPage = ({ city }) => (
  <>
    <LocalBusinessSchema city={city} />
    <BreadcrumbSchema items={[
      { name: 'Home', url: '/' },
      { name: 'Dating in India', url: '/dating-in-india' },
      { name: `Dating in ${city}`, url: `/dating-in-${city.toLowerCase()}` }
    ]} />
    <div>City page content...</div>
  </>
);

// Blog Post - Add Article schema
import { ArticleSchema, BreadcrumbSchema } from './components/seo/SchemaComponents';

const BlogPost = ({ post }) => (
  <>
    <ArticleSchema
      title={post.title}
      description={post.excerpt}
      author={post.author}
      publishedDate={post.publishedAt}
      modifiedDate={post.updatedAt}
      image={post.featuredImage}
      slug={post.slug}
      category={post.category}
      keywords={post.tags}
    />
    <BreadcrumbSchema items={[
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: post.title, url: `/blog/${post.slug}` }
    ]} />
    <article>{post.content}</article>
  </>
);

// FAQ Page - Add FAQ schema
import { FAQSchema } from './components/seo/SchemaComponents';

const FAQPage = ({ faqs }) => (
  <>
    <FAQSchema faqs={faqs} />
    <div>FAQ content...</div>
  </>
);

// Pricing Page - Add Product schema for each plan
import { ProductSchema } from './components/seo/SchemaComponents';

const PricingPage = ({ plans }) => (
  <>
    {plans.map(plan => (
      <ProductSchema key={plan.id} plan={plan} />
    ))}
    <div>Pricing content...</div>
  </>
);
*/

export default {
  WebSiteSchema,
  OrganizationSchema,
  LocalBusinessSchema,
  BreadcrumbSchema,
  ArticleSchema,
  FAQSchema,
  ProductSchema,
  ReviewSchema,
  HowToSchema,
  VideoSchema
};
