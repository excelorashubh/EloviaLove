import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../data/seoContent';

const CountryPageSEO = ({ country, metaTitle, metaDescription, canonicalUrl, faqs }) => {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Elovia Love",
    "url": SITE_URL,
    "logo": `${SITE_URL}/EloviaLoveWB.png`,
    "description": "India's most trusted dating platform for verified singles seeking meaningful relationships",
    "sameAs": [
      "https://www.facebook.com/elovialove",
      "https://www.instagram.com/elovialove",
      "https://twitter.com/elovialove"
    ]
  };

  // CollectionPage Schema
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Dating in ${country}`,
    "description": metaDescription,
    "url": `${SITE_URL}${canonicalUrl}`,
    "publisher": {
      "@type": "Organization",
      "name": "Elovia Love",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/EloviaLoveWB.png`
      }
    }
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `Dating in ${country}`,
        "item": `${SITE_URL}${canonicalUrl}`
      }
    ]
  };

  // FAQPage Schema
  const faqSchema = faqs ? {
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
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={`${SITE_URL}${canonicalUrl}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={`${SITE_URL}${canonicalUrl}`} />
      <meta property="og:site_name" content="Elovia Love" />
      <meta property="og:image" content={`${SITE_URL}/EloviaLoveWB.png`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${SITE_URL}/EloviaLoveWB.png`} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(collectionPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default CountryPageSEO;
