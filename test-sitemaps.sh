#!/bin/bash

# ══════════════════════════════════════════════════════════════════════════════
# SITEMAP TESTING SCRIPT - Elovia Love
# ══════════════════════════════════════════════════════════════════════════════
# Tests all sitemap endpoints to verify they return XML
# Usage: bash test-sitemaps.sh
# ══════════════════════════════════════════════════════════════════════════════

BASE_URL="https://elovialove.onrender.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════════"
echo " SITEMAP TESTING - Elovia Love"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Target: ${BLUE}${BASE_URL}${NC}"
echo ""

# Function to test a sitemap endpoint
test_sitemap() {
    local endpoint=$1
    local url="${BASE_URL}${endpoint}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "${BLUE}Testing:${NC} ${endpoint}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get HTTP status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    # Get Content-Type header
    content_type=$(curl -s -I "$url" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r')
    
    # Get first line of response
    first_line=$(curl -s "$url" | head -n 1)
    
    echo "HTTP Status: ${status_code}"
    echo "Content-Type: ${content_type}"
    echo "First Line: ${first_line}"
    
    # Validate
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} HTTP 200 OK"
    else
        echo -e "${RED}✗${NC} HTTP ${status_code} (expected 200)"
        return 1
    fi
    
    if [[ "$content_type" == *"xml"* ]]; then
        echo -e "${GREEN}✓${NC} Content-Type is XML"
    else
        echo -e "${RED}✗${NC} Content-Type is NOT XML: ${content_type}"
        return 1
    fi
    
    if [[ "$first_line" == *"<?xml"* ]]; then
        echo -e "${GREEN}✓${NC} Response is XML"
    elif [[ "$first_line" == *"<!DOCTYPE html"* ]] || [[ "$first_line" == *"<html"* ]]; then
        echo -e "${RED}✗${NC} Response is HTML (React app)!"
        return 1
    else
        echo -e "${YELLOW}⚠${NC} Response format unclear"
        return 1
    fi
    
    echo -e "${GREEN}✓ PASS${NC}"
    echo ""
    return 0
}

# Test all sitemaps
passed=0
failed=0

echo "${YELLOW}═══ TESTING SITEMAP INDEX ═══${NC}"
echo ""
if test_sitemap "/sitemap.xml"; then
    ((passed++))
else
    ((failed++))
fi

echo "${YELLOW}═══ TESTING CHILD SITEMAPS ═══${NC}"
echo ""

if test_sitemap "/sitemap-pages.xml"; then
    ((passed++))
else
    ((failed++))
fi

if test_sitemap "/sitemap-cities.xml"; then
    ((passed++))
else
    ((failed++))
fi

if test_sitemap "/sitemap-blog.xml"; then
    ((passed++))
else
    ((failed++))
fi

if test_sitemap "/sitemap-images.xml"; then
    ((passed++))
else
    ((failed++))
fi

# Summary
echo "════════════════════════════════════════════════════════════════"
echo " TEST SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests: $((passed + failed))"
echo -e "${GREEN}Passed: ${passed}${NC}"
echo -e "${RED}Failed: ${failed}${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Submit to Google Search Console"
    echo "2. Monitor discovered pages for 48 hours"
    echo "3. Verify all pages are indexed"
    echo ""
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check server logs for route registration"
    echo "2. Verify routes are being hit"
    echo "3. Check Content-Type headers"
    echo "4. See SITEMAP_ROUTING_FIX_FINAL_REPORT.md"
    echo ""
    exit 1
fi
