# ══════════════════════════════════════════════════════════════════════════════
# SITEMAP TESTING SCRIPT - Elovia Love (PowerShell)
# ══════════════════════════════════════════════════════════════════════════════
# Tests all sitemap endpoints to verify they return XML
# Usage: .\test-sitemaps.ps1
# ══════════════════════════════════════════════════════════════════════════════

$BaseUrl = "https://elovialove.onrender.com"

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " SITEMAP TESTING - Elovia Love" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target: $BaseUrl" -ForegroundColor Blue
Write-Host ""

# Function to test a sitemap endpoint
function Test-Sitemap {
    param (
        [string]$Endpoint
    )
    
    $Url = "$BaseUrl$Endpoint"
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Testing: $Endpoint" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    try {
        # Make request
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing
        
        $statusCode = $response.StatusCode
        $contentType = $response.Headers['Content-Type']
        $firstLine = ($response.Content -split "`n")[0].Trim()
        
        Write-Host "HTTP Status: $statusCode"
        Write-Host "Content-Type: $contentType"
        Write-Host "First Line: $firstLine"
        
        $passed = $true
        
        # Validate HTTP 200
        if ($statusCode -eq 200) {
            Write-Host "✓ HTTP 200 OK" -ForegroundColor Green
        } else {
            Write-Host "✗ HTTP $statusCode (expected 200)" -ForegroundColor Red
            $passed = $false
        }
        
        # Validate Content-Type
        if ($contentType -like "*xml*") {
            Write-Host "✓ Content-Type is XML" -ForegroundColor Green
        } else {
            Write-Host "✗ Content-Type is NOT XML: $contentType" -ForegroundColor Red
            $passed = $false
        }
        
        # Validate response content
        if ($firstLine -like "*<?xml*") {
            Write-Host "✓ Response is XML" -ForegroundColor Green
        } elseif ($firstLine -like "*<!DOCTYPE html*" -or $firstLine -like "*<html*") {
            Write-Host "✗ Response is HTML (React app)!" -ForegroundColor Red
            $passed = $false
        } else {
            Write-Host "⚠ Response format unclear" -ForegroundColor Yellow
            $passed = $false
        }
        
        if ($passed) {
            Write-Host "✓ PASS" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red
            Write-Host ""
            return $false
        }
        
    } catch {
        Write-Host "✗ ERROR: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Test all sitemaps
$passed = 0
$failed = 0

Write-Host "═══ TESTING SITEMAP INDEX ═══" -ForegroundColor Yellow
Write-Host ""
if (Test-Sitemap "/sitemap.xml") { $passed++ } else { $failed++ }

Write-Host "═══ TESTING CHILD SITEMAPS ═══" -ForegroundColor Yellow
Write-Host ""

if (Test-Sitemap "/sitemap-pages.xml") { $passed++ } else { $failed++ }
if (Test-Sitemap "/sitemap-cities.xml") { $passed++ } else { $failed++ }
if (Test-Sitemap "/sitemap-blog.xml") { $passed++ } else { $failed++ }
if (Test-Sitemap "/sitemap-images.xml") { $passed++ } else { $failed++ }

# Summary
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " TEST SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($passed + $failed)"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Submit to Google Search Console"
    Write-Host "2. Monitor discovered pages for 48 hours"
    Write-Host "3. Verify all pages are indexed"
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:"
    Write-Host "1. Check server logs for route registration"
    Write-Host "2. Verify routes are being hit"
    Write-Host "3. Check Content-Type headers"
    Write-Host "4. See SITEMAP_ROUTING_FIX_FINAL_REPORT.md"
    Write-Host ""
    exit 1
}
