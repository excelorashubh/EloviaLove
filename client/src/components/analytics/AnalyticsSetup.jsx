// ── Complete Analytics & SEO Monitoring Setup ───────────────────────────────

// 1. Google Analytics 4 Setup
export const GA4_CONFIG = {
  measurementId: process.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',

  // Enhanced E-commerce tracking for dating platform
  ecommerce: {
    enabled: true,
    events: {
      subscription_start: 'begin_checkout',
      subscription_complete: 'purchase',
      profile_view: 'view_item',
      match_created: 'add_to_cart', // Using cart as "matches" metaphor
      message_sent: 'contact'
    }
  },

  // Custom events for dating platform
  customEvents: {
    user_registration: 'sign_up',
    profile_completion: 'profile_complete',
    photo_upload: 'photo_upload',
    verification_complete: 'verification_complete',
    match_like: 'match_like',
    match_pass: 'match_pass',
    chat_initiated: 'chat_start',
    safety_report: 'safety_report'
  }
};

// 2. Google Search Console Integration
export const GSC_CONFIG = {
  verification: {
    method: 'html_file', // or 'meta_tag', 'dns_record'
    verificationToken: 'google-site-verification-token'
  },

  // Monitoring queries
  monitoringQueries: [
    'dating in [city]',
    'find love in [city]',
    'serious dating [city]',
    'verified dating app',
    'safe dating online',
    'dating safety tips',
    'relationship advice',
    'dating tips for [demographic]'
  ],

  // Index coverage alerts
  indexCoverage: {
    criticalErrors: true,
    submittedNotIndexed: true,
    indexedNotSubmitted: false
  }
};

// 3. Bing Webmaster Tools Setup
export const BING_WMT_CONFIG = {
  verification: {
    method: 'meta_tag',
    content: 'msvalidate.01=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },

  // Bing-specific tracking
  tracking: {
    organicSearch: true,
    paidSearch: false,
    socialMedia: true
  }
};

// 4. Microsoft Clarity Setup
export const CLARITY_CONFIG = {
  projectId: 'XXXXXXXXXXXXXXXX',

  // Heatmaps and recordings
  heatmaps: {
    enabled: true,
    scrollDepth: true,
    clickTracking: true,
    rageClicks: true
  },

  // Session recordings
  recordings: {
    enabled: true,
    sampleRate: 0.1, // 10% of sessions
    privacyMode: true
  },

  // Custom events
  customEvents: {
    form_abandonment: 'form_abandon',
    search_usage: 'search_performed',
    content_engagement: 'content_read_50',
    safety_interaction: 'safety_feature_used'
  }
};

// 5. Ahrefs Webmaster Tools Integration
export const AHREFS_WMT_CONFIG = {
  verification: {
    method: 'html_file',
    filename: 'ahrefs_verification.html',
    content: 'ahrefs-site-verification-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },

  // Backlink monitoring
  backlinks: {
    alertNew: true,
    alertLost: true,
    alertBroken: true
  },

  // Crawl monitoring
  crawl: {
    enableCrawling: true,
    crawlDelay: 1,
    respectRobotsTxt: true
  }
};

// ── Analytics Implementation Components ──────────────────────────────────────

// 1. GA4 Event Tracking Hook
export const useAnalytics = () => {
  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...parameters,
        custom_parameter_1: 'dating_platform'
      });
    }
  };

  const trackPageView = (pagePath, pageTitle) => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA4_CONFIG.measurementId, {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  };

  const trackEcommerce = (event, items, value) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, {
        currency: 'INR',
        value: value,
        items: items
      });
    }
  };

  return { trackEvent, trackPageView, trackEcommerce };
};

// 2. SEO Performance Monitoring Component
export const SEOMonitor = () => {
  const { trackEvent } = useAnalytics();

  // Track organic search visits
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    // Check if from organic search
    if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('yahoo.')) {
      trackEvent('organic_search_visit', {
        referrer: referrer,
        landing_page: window.location.pathname,
        search_engine: referrer.includes('google') ? 'google' :
                      referrer.includes('bing') ? 'bing' : 'yahoo'
      });
    }

    // Track GSC parameters if present
    if (urlParams.has('utm_source') && urlParams.get('utm_source') === 'google') {
      trackEvent('gsc_parameter_detected', {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign')
      });
    }
  }, []);

  return null;
};

// 3. Crawl Monitoring Component
export const CrawlMonitor = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Detect crawler user agents
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('googlebot') || userAgent.includes('bingbot')) {
      trackEvent('crawler_visit', {
        crawler_type: userAgent.includes('googlebot') ? 'google' : 'bing',
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }

    // Monitor page load performance for SEO
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      trackEvent('page_load_performance', {
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load_complete: navigation.loadEventEnd - navigation.loadEventStart,
        page_url: window.location.pathname
      });
    }
  }, []);

  return null;
};

// 4. Index Coverage Monitoring
export const IndexCoverageMonitor = () => {
  const { trackEvent } = useAnalytics();

  const checkIndexStatus = async () => {
    try {
      // Check if page is indexed (simplified version)
      const response = await fetch(`/api/seo/check-index?url=${encodeURIComponent(window.location.href)}`);
      const data = await response.json();

      trackEvent('index_status_check', {
        page_url: window.location.href,
        is_indexed: data.isIndexed,
        last_crawl: data.lastCrawl,
        crawl_frequency: data.crawlFrequency
      });
    } catch (error) {
      console.error('Index check failed:', error);
    }
  };

  useEffect(() => {
    // Check index status periodically (every 24 hours)
    const checkInterval = setInterval(checkIndexStatus, 24 * 60 * 60 * 1000);
    checkIndexStatus(); // Initial check

    return () => clearInterval(checkInterval);
  }, []);

  return null;
};

// ── Dashboard Components for Monitoring ──────────────────────────────────────

// 1. SEO Metrics Dashboard
export const SEOMetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [gscData, gaData, ahrefsData] = await Promise.all([
          fetch('/api/seo/gsc-metrics').then(r => r.json()),
          fetch('/api/analytics/ga-metrics').then(r => r.json()),
          fetch('/api/seo/ahrefs-metrics').then(r => r.json())
        ]);

        setMetrics({ gsc: gscData, ga: gaData, ahrefs: ahrefsData });
      } catch (error) {
        console.error('Failed to fetch SEO metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  if (!metrics) return <div>Loading SEO metrics...</div>;

  return (
    <div className="seo-dashboard grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Google Search Console */}
      <div className="metric-card bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Search Console</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Indexed Pages:</span>
            <span className="font-bold">{metrics.gsc.indexedPages}</span>
          </div>
          <div className="flex justify-between">
            <span>Crawl Errors:</span>
            <span className="font-bold text-red-600">{metrics.gsc.crawlErrors}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg. Position:</span>
            <span className="font-bold">{metrics.gsc.averagePosition}</span>
          </div>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="metric-card bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Organic Traffic:</span>
            <span className="font-bold">{metrics.ga.organicTraffic}</span>
          </div>
          <div className="flex justify-between">
            <span>Conversion Rate:</span>
            <span className="font-bold">{metrics.ga.conversionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg. Session:</span>
            <span className="font-bold">{metrics.ga.avgSessionDuration}</span>
          </div>
        </div>
      </div>

      {/* Ahrefs Backlinks */}
      <div className="metric-card bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Backlinks</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Backlinks:</span>
            <span className="font-bold">{metrics.ahrefs.totalBacklinks}</span>
          </div>
          <div className="flex justify-between">
            <span>Domain Rating:</span>
            <span className="font-bold">{metrics.ahrefs.domainRating}</span>
          </div>
          <div className="flex justify-between">
            <span>New This Month:</span>
            <span className="font-bold text-green-600">{metrics.ahrefs.newThisMonth}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Implementation Guide ─────────────────────────────────────────────────────

// 1. Add to index.html head:
/*
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "XXXXXXXXXXXXXXXX");
</script>

<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="your-verification-token" />

<!-- Bing Webmaster Tools Verification -->
<meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
*/

// 2. Add to App.jsx:
/*
import { SEOMonitor, CrawlMonitor, IndexCoverageMonitor } from './components/analytics/AnalyticsSetup';

function App() {
  return (
    <Router>
      <SEOMonitor />
      <CrawlMonitor />
      <IndexCoverageMonitor />

      <Routes>
        // ... your routes
      </Routes>
    </Router>
  );
}
*/

// 3. Server-side API endpoints needed:
/*
// GET /api/seo/gsc-metrics
// GET /api/analytics/ga-metrics
// GET /api/seo/ahrefs-metrics
// GET /api/seo/check-index?url=...
*/

export {
  GA4_CONFIG,
  GSC_CONFIG,
  BING_WMT_CONFIG,
  CLARITY_CONFIG,
  AHREFS_WMT_CONFIG,
  useAnalytics,
  SEOMonitor,
  CrawlMonitor,
  IndexCoverageMonitor,
  SEOMetricsDashboard
};