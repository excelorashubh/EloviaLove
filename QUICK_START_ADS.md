# 🚀 QUICK START: Advertising System

## ✅ What's Done

All backend and component infrastructure is complete and ready to use.

## 🎯 What You Need To Do

### Step 1: Add Environment Variables (2 minutes)

Create/update `client/.env`:

```env
VITE_ADSENSE_CLIENT_ID=ca-pub-7967762028283267
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# These are placeholder IDs - replace with real ones from AdSense
VITE_ADSENSE_SLOT_HOME_HERO=1234567890
VITE_ADSENSE_SLOT_HOME_FEATURES=1234567891
VITE_ADSENSE_SLOT_HOME_TESTIMONIALS=1234567892
VITE_ADSENSE_SLOT_BLOG_POST_TOP=2345678902
```

### Step 2: Add Ads to Home Page (10 minutes)

File: `client/src/pages/Home.jsx`

**Add imports at top:**
```jsx
import AdWrapper from '../components/ads/AdWrapper';
import BannerAd from '../components/ads/BannerAd';
```

**Add this code after the hero section (around line 242):**
```jsx
{/* Ad: After Hero */}
<AdWrapper showUpgradeNudge>
  <div className="max-w-4xl mx-auto px-4 my-12">
    <BannerAd 
      slot={import.meta.env.VITE_ADSENSE_SLOT_HOME_HERO} 
      className="shadow-sm"
    />
  </div>
</AdWrapper>
```

**Add after "How It Works" section:**
```jsx
{/* Ad: After Features */}
<AdWrapper showUpgradeNudge>
  <div className="max-w-4xl mx-auto px-4 my-12">
    <BannerAd 
      slot={import.meta.env.VITE_ADSENSE_SLOT_HOME_FEATURES} 
      className="shadow-sm"
    />
  </div>
</AdWrapper>
```

### Step 3: Add Ads to Blog Post (10 minutes)

File: `client/src/pages/BlogPost.jsx`

**Add imports:**
```jsx
import AdWrapper from '../components/ads/AdWrapper';
import BannerAd from '../components/ads/BannerAd';
```

**Add after blog introduction:**
```jsx
{/* Ad: After Introduction */}
<AdWrapper showUpgradeNudge>
  <div className="max-w-3xl mx-auto my-8">
    <BannerAd slot={import.meta.env.VITE_ADSENSE_SLOT_BLOG_POST_TOP} />
  </div>
</AdWrapper>
```

### Step 4: Test Locally (5 minutes)

```bash
cd client
npm run dev
```

- Visit homepage
- Look for ad placeholder boxes (gray boxes with "Ad slot: XXX")
- Log in as free user → should see ads
- Log in as premium user → should NOT see ads

## 📊 How It Works

### For Free Users:
- Sees gray placeholder boxes in development
- Sees real Google AdSense ads in production
- Can click "Upgrade to remove ads" link

### For Premium Users:
- Sees NOTHING - completely ad-free
- No ad scripts loaded
- Clean experience

### For Developers:
- Development mode shows labeled placeholders
- Production mode shows real ads
- AdWrapper handles all the logic

## 🎨 Ad Components Available

```jsx
// Standard banner ad
<BannerAd slot="..." />

// Sidebar ad (300×250)
<SidebarAd slot="..." />

// In-feed native ad
<InFeedAd slot="..." />

// Premium upgrade card (instead of ad)
<PremiumAdCard variant="compact" />

// Wrapper (REQUIRED - handles free vs premium)
<AdWrapper showUpgradeNudge>
  <BannerAd slot="..." />
</AdWrapper>
```

## 🔍 Testing Checklist

- [ ] Homepage shows ad placeholders
- [ ] Blog post shows ad placeholders
- [ ] Ads hidden when logged in as premium user
- [ ] "Upgrade to remove ads" link works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Page loads smoothly (no layout shift)

## 🚀 Production Deployment

1. Get real AdSense slot IDs from: https://adsense.google.com
2. Update environment variables with real IDs
3. Deploy to production
4. Verify ads show (logged out)
5. Verify ad-free for premium users
6. Submit for AdSense review

## 📝 Documentation

See full documentation in:
- `ADVERTISING_IMPLEMENTATION_COMPLETE.md` - Complete guide
- `ADVERTISING_SYSTEM_IMPLEMENTATION.md` - Architecture details
- `AD_IMPLEMENTATION_FILES.md` - File-by-file breakdown

## ❓ Need Help?

**Ads not showing?**
- Check VITE_ADSENSE_CLIENT_ID is set
- Verify user.plan in database
- Test in incognito mode (no ad blocker)

**Ads showing for premium users?**
- Check AdWrapper is used
- Verify user.plan !== 'free'
- Check AuthContext.user exists

**Layout jumping?**
- Ad containers have min-height
- This is expected and handled

---

**Ready to start!** Begin with Step 1 above. ⬆️
