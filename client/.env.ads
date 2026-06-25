# ══════════════════════════════════════════════════════════════════════════════
# GOOGLE ADSENSE CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════
# Get these values from: https://adsense.google.com

# AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-7967762028283267

# Ad Slot IDs (create these in your AdSense dashboard)
# Top Banner (728×90 desktop, 320×100 mobile)
VITE_GOOGLE_ADSENSE_SLOT_TOP=1234567890

# Sidebar Ad (300×250)
VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR=2345678901

# Native/In-Feed Ad (fluid)
VITE_GOOGLE_ADSENSE_SLOT_NATIVE=3456789012

# Mobile Banner/Sticky (320×50 or 320×100)
VITE_GOOGLE_ADSENSE_SLOT_MOBILE=4567890123

# ══════════════════════════════════════════════════════════════════════════════
# SETUP INSTRUCTIONS
# ══════════════════════════════════════════════════════════════════════════════
# 1. Copy this file content to client/.env
# 2. Sign up for Google AdSense: https://www.google.com/adsense/
# 3. Add your website to AdSense
# 4. Create ad units in AdSense dashboard
# 5. Replace the placeholder slot IDs above with your real slot IDs
# 6. Rebuild the app: npm run build
# 7. Deploy to production
#
# Note: Ads only show for free plan users. Premium users see no ads.
