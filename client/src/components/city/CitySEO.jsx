import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../data/seoContent';

const CitySEO = ({ city, metaTitle, metaDescription, canonicalUrl, faqs = [] }) => {
  const faqSchema = faqs.map((faq, index) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}${canonicalUrl}`,
        "url": `${SITE_URL}${canonicalUrl}`,
        "name": metaTitle,
        "description": metaDescription,
        "inLanguage": "en-IN",
        "isPartOf": {
          "@id": `${SITE_URL}/#website`
        }
      },
      {
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
            "name": `Dating in ${city}`,
            "item": `${SITE_URL}${canonicalUrl}`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqSchema
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Elovia Love",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/EloviaLoveWB.png`
        },
        "sameAs": [
          "https://www.facebook.com/elovialove",
          "https://www.instagram.com/elovialove",
          "https://www.twitter.com/elovialove"
        ]
      }
    ]
  };

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={`${SITE_URL}${canonicalUrl}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={`${SITE_URL}${canonicalUrl}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Elovia Love" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:site" content="@elovialove" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default CitySEO;
