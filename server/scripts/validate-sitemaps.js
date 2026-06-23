#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SITEMAP VALIDATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * Tests all sitemap endpoints and validates their content
 * Run: node server/scripts/validate-sitemaps.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.CLIENT_URL || 'https://elovialove.onrender.com';
const USE_HTTPS = BASE_URL.startsWith('https');
const client = USE_HTTPS ? https : http;

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

/**
 * Fetch URL and return response data
 */
const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
};

/**
 * Validate XML structure
 */
const validateXml = (xml) => {
  const issues = [];
  
  // Check XML declaration
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    issues.push('Missing or incorrect XML declaration');
  }
  
  // Check for required namespace
  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    issues.push('Missing sitemap namespace');
  }
  
  // Check for unclosed tags (basic check)
  const openTags = (xml.match(/<[^/][^>]*[^/]>/g) || []).length;
  const closeTags = (xml.match(/<\/[^>]+>/g) || []).length;
  if (openTags !== closeTags) {
    issues.push(`Mismatched tags: ${openTags} open, ${closeTags} close`);
  }
  
  return issues;
};

/**
 * Extract URLs from sitemap XML
 */
const extractUrls = (xml) => {
  const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
};

/**
 * Count elements in XML
 */
const countElements = (xml, tag) => {
  const regex = new RegExp(`<${tag}>`, 'g');
  return (xml.match(regex) || []).length;
};

/**
 * Test a sitemap endpoint
 */
const testSitemap = async (endpoint, expectedType) => {
  const url = `${BASE_URL}${endpoint}`;
  log.info(`Testing: ${endpoint}`);
  
  try {
    const response = await fetchUrl(url);
    
    // Check HTTP status
    if (response.statusCode !== 200) {
      log.error(`HTTP ${response.statusCode} (expected 200)`);
      return false;
    }
    
    // Check content type
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('xml')) {
      log.warn(`Content-Type: ${contentType} (expected XML)`);
    }
    
    // Validate XML structure
    const xmlIssues = validateXml(response.body);
    if (xmlIssues.length > 0) {
      xmlIssues.forEach(issue => log.error(issue));
      return false;
    }
    
    // Check expected root element
    if (expectedType === 'index') {
      if (!response.body.includes('<sitemapindex')) {
        log.error('Missing <sitemapindex> root element');
        return false;
      }
      const sitemapCount = countElements(response.body, 'sitemap');
      log.success(`Valid sitemap index with ${sitemapCount} sub-sitemaps`);
    } else {
      if (!response.body.includes('<urlset')) {
        log.error('Missing <urlset> root element');
        return false;
      }
      const urlCount = countElements(response.body, 'url');
      log.success(`Valid sitemap with ${urlCount} URLs`);
    }
    
    // Extract and display URLs
    const urls = extractUrls(response.body);
    if (urls.length > 0) {
      log.info(`Sample URLs (first 5):`);
      urls.slice(0, 5).forEach(url => {
        console.log(`  - ${url}`);
      });
      if (urls.length > 5) {
        console.log(`  ... and ${urls.length - 5} more`);
      }
    }
    
    // Validate domain
    const wrongDomain = urls.filter(url => !url.startsWith(BASE_URL));
    if (wrongDomain.length > 0) {
      log.error(`Found ${wrongDomain.length} URLs with wrong domain:`);
      wrongDomain.slice(0, 3).forEach(url => console.log(`  - ${url}`));
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to fetch: ${error.message}`);
    return false;
  }
};

/**
 * Main validation function
 */
const validateSitemaps = async () => {
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bright}  ELOVIA LOVE - SITEMAP VALIDATION${colors.reset}`);
  console.log('═'.repeat(80));
  console.log(`Target: ${colors.cyan}${BASE_URL}${colors.reset}\n`);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };
  
  // Test sitemap endpoints
  const tests = [
    { endpoint: '/sitemap.xml', type: 'index', name: 'Main Sitemap Index' },
    { endpoint: '/sitemap-pages.xml', type: 'urlset', name: 'Pages Sitemap' },
    { endpoint: '/sitemap-cities.xml', type: 'urlset', name: 'Cities Sitemap' },
    { endpoint: '/sitemap-blog.xml', type: 'urlset', name: 'Blog Sitemap' },
    { endpoint: '/sitemap-images.xml', type: 'urlset', name: 'Images Sitemap' },
  ];
  
  for (const test of tests) {
    log.section(`Testing: ${test.name}`);
    results.total++;
    
    const passed = await testSitemap(test.endpoint, test.type);
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    console.log(''); // Blank line between tests
  }
  
  // Summary
  log.section('VALIDATION SUMMARY');
  console.log(`Total Tests:  ${results.total}`);
  console.log(`${colors.green}Passed:${colors.reset}       ${results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}       ${results.failed}`);
  
  const scorePercent = Math.round((results.passed / results.total) * 100);
  const scoreColor = scorePercent === 100 ? colors.green : 
                     scorePercent >= 80 ? colors.yellow : colors.red;
  
  console.log(`\n${colors.bright}SEO Score:${colors.reset}    ${scoreColor}${scorePercent}%${colors.reset}\n`);
  
  // Final verdict
  if (results.failed === 0) {
    log.success('All sitemaps are valid and ready for production! ✨');
    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    console.log('  1. Submit to Google Search Console');
    console.log('  2. Monitor indexing status in 24-48 hours');
    console.log('  3. Check for crawl errors weekly\n');
    process.exit(0);
  } else {
    log.error('Some sitemaps have validation errors. Please fix them before deployment.');
    console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log('  1. Check server logs for errors');
    console.log('  2. Verify MongoDB connection');
    console.log('  3. Test locally first (localhost:5000)\n');
    process.exit(1);
  }
};

// Run validation
validateSitemaps().catch(error => {
  log.error(`Validation failed: ${error.message}`);
  process.exit(1);
});
