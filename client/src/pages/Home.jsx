import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Star, Shield, Zap, MessageCircle, MapPin, Users, HeartHandshake, Quote } from 'lucide-react';
import { WebSiteSchema, OrganizationSchema, BreadcrumbSchema } from '../components/seo/SchemaComponents';

const FAQAccordion = React.lazy(() => import('../components/FAQAccordion'));
const BannerAd = React.lazy(() => import('../components/ads/BannerAd'));
const AdWrapper = React.lazy(() => import('../components/ads/AdWrapper'));

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Home = () => {
  return (
    <>
      {/* ── SEO Schema Markup ── */}
      <WebSiteSchema />
      <OrganizationSchema />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' }
      ]} />
      
      <Helmet>
        <title>Elovia Love – India's Verified Dating App for Serious Relationships</title>
        <meta name="description" content="Find real love on India's most trusted dating platform. Verified profiles, AI-powered matching, and advanced safety features. Join 10,000+ singles finding serious relationships. Start free today." />
        <link rel="canonical" href="https://elovialove.onrender.com/" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fm=webp" fetchpriority="high" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Elovia Love – India's Verified Dating App for Serious Relationships" />
        <meta property="og:description" content="Find real love on India's most trusted dating platform. Verified profiles, AI-powered matching, and advanced safety features." />
        <meta property="og:url" content="https://elovialove.onrender.com/" />
        <meta property="og:image" content="https://elovialove.onrender.com/EloviaLoveWB.png" />
        <meta property="og:site_name" content="Elovia Love" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elovia Love – India's Verified Dating App" />
        <meta name="twitter:description" content="Find real love on India's most trusted dating platform. Verified profiles, AI-powered matching, and advanced safety features." />
        <meta name="twitter:image" content="https://elovialove.onrender.com/EloviaLoveWB.png" />
        
        {/* Keywords */}
        <meta name="keywords" content="online dating India, verified dating app, serious relationships India, safe dating platform, Indian dating site, dating app India, find life partner, meaningful connections, marriage minded singles" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is Elovia Love for serious relationships?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Elovia Love is specifically designed for singles seeking serious, long-term relationships. Unlike casual dating apps, we focus on meaningful connections and compatibility matching to help you find a partner who shares your values and life goals."
                }
              },
              {
                "@type": "Question",
                "name": "How does profile verification work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Every profile on Elovia Love goes through a comprehensive verification process. Users must provide government-issued ID, complete a detailed questionnaire, and submit photos that are manually reviewed by our team. This ensures you're connecting with real people who are genuinely interested in relationships."
                }
              },
              {
                "@type": "Question",
                "name": "Is Elovia Love safe for online dating?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Safety is our top priority. We use bank-level encryption for all communications, provide advanced privacy controls, and offer safety tools like emergency contact sharing and location check-ins. Our verification process eliminates fake profiles, and we have a dedicated safety team that responds to reports within 24 hours."
                }
              },
              {
                "@type": "Question",
                "name": "How does the matching algorithm work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI-powered matching system considers multiple factors including your personality traits, values, lifestyle preferences, cultural background, and relationship goals. We go beyond surface-level matching to ensure compatibility that leads to lasting relationships."
                }
              },
              {
                "@type": "Question",
                "name": "Is Elovia Love free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can create a profile and browse matches for free. Premium features like unlimited messaging, advanced filters, and priority matching are available through our subscription plans. We believe in quality over quantity, so even our free features are designed to help you find meaningful connections."
                }
              },
              {
                "@type": "Question",
                "name": "What makes Elovia Love different from other dating apps?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Unlike casual dating apps focused on swiping and quick matches, Elovia Love is built for serious relationships. We verify every profile, use compatibility-based matching, and provide tools for meaningful conversations. Our platform is designed for Indian singles who want long-term partnerships rather than casual encounters."
                }
              },
              {
                "@type": "Question",
                "name": "How do I know if someone is verified?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Verified profiles display a blue checkmark badge next to their name. This badge indicates they've completed our verification process, including ID submission, photo review, and questionnaire completion. You can only match with verified users, ensuring authenticity."
                }
              },
              {
                "@type": "Question",
                "name": "What safety features does Elovia Love offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer comprehensive safety features including emergency contact sharing, location check-ins, photo verification, encrypted messaging, and a 24/7 safety team. You can also block/report suspicious users, and all profiles are manually reviewed before approval."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use Elovia Love if I'm looking for marriage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. Many of our users are marriage-minded singles. Our matching algorithm considers relationship goals, and you can specify 'marriage' as your objective in your profile. We help connect people who share similar long-term aspirations."
                }
              },
              {
                "@type": "Question",
                "name": "How does Elovia Love handle cultural compatibility?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our platform is designed with Indian cultural context in mind. We consider factors like family values, religious preferences, and cultural background in our matching algorithm. This helps create more compatible, lasting relationships within the Indian community."
                }
              }
            ]
          })}
        </script>
      </Helmet>
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fm=webp')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/95" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold border border-primary-100 shadow-sm">
              <SparklesIcon className="w-4 h-4 text-primary-500" />
              #1 Dating App for Genuine Connections
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
          >
            Find Real Love on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-pink-500">India's Verified Dating App</span> for Serious Relationships
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            Join India's safest online dating platform with verified profiles, AI-powered matching, and advanced safety features. Start meaningful conversations with singles seeking serious relationships today.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-full font-bold text-lg shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Join Now It's Free <HeartHandshake size={20} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 rounded-full font-bold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300"
            >
              Log in to Account
            </Link>
            <Link
              to="/blog"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg border border-transparent shadow-sm hover:bg-primary-600 transition-all duration-300"
            >
              Read Latest Blog Articles
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-slate-400">Join thousands of singles finding real love</p>
          </motion.div>

          {/* User faces pile up mock */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-col items-center justify-center"
          >
            <div className="flex -space-x-4 mb-3">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fm=webp&fit=crop",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fm=webp&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fm=webp&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fm=webp&fit=crop",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fm=webp&fit=crop",
              ].map((src, idx) => (
                <img key={idx} className="w-12 h-12 rounded-full border-4 border-white object-cover" src={src} alt="User" loading="lazy" width="48" height="48" />
              ))}
            </div>
            <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <span className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </span>
              <span className="ml-2 font-semibold text-slate-700">4.9/5</span> from over 10,000+ happy couples
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">How Elovia Love Works: Your Journey to Finding Love</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our verified dating platform is designed to help serious singles in India find meaningful relationships through a safe, structured process. From profile verification to AI-powered matching, every step is optimized for your success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">1. Verify Your Profile</h3>
              <p className="text-slate-600 leading-relaxed">
                Every member undergoes a comprehensive verification process to ensure authenticity. We require government-issued ID, detailed questionnaires, and photo reviews manually checked by our team. This rigorous process eliminates fake profiles, prevents catfishing, and creates a trustworthy community of genuine singles looking for serious relationships. Your verified badge shows others you're real and serious about finding love.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">2. Smart AI-Powered Matching</h3>
              <p className="text-slate-600 leading-relaxed">
                Our advanced AI matching algorithm considers multiple compatibility factors including your personality traits, core values, lifestyle preferences, cultural background, religious beliefs, and long-term relationship goals. Unlike superficial swipe-based dating apps, we focus on deep compatibility that leads to lasting relationships. Our smart matching system learns from your preferences to suggest better matches over time, helping you find your perfect life partner.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">3. Start Meaningful Conversations</h3>
              <p className="text-slate-600 leading-relaxed">
                Begin conversations with intelligent icebreakers specifically designed for serious relationships. Our platform encourages thoughtful communication and provides comprehensive safety tools including emergency contact sharing, location-based safety check-ins, and direct access to our 24/7 safety team. Unlike casual dating apps, we create an environment for deep, meaningful conversations that lead to genuine connections and lasting love.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Choose Elovia Love Over Other Dating Apps in India?</h3>
            <p className="text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
              In a market flooded with casual dating apps, Elovia Love stands out as India's best dating app for serious relationships. We don't just connect people—we help build lasting partnerships through verified profiles and AI-powered matching. Our comprehensive verification process ensures every profile is real, our smart matching algorithm focuses on compatibility and shared values, and our community guidelines promote respectful, meaningful interactions. Unlike apps designed for quick matches and hookups, we create a safe dating platform where Indian singles can take their time to develop genuine connections and find their life partner.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">100% Verified Profiles Only</h4>
                <p className="text-slate-600 text-sm">No fake accounts, no catfishing, no scams. Every member is thoroughly vetted through our comprehensive verification process with government ID and photo validation.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Serious Relationship Focus</h4>
                <p className="text-slate-600 text-sm">Designed exclusively for commitment-minded singles seeking long-term partnerships and marriage. Perfect for those tired of casual dating and hookup culture.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Advanced Safety Features</h4>
                <p className="text-slate-600 text-sm">Bank-level encryption, emergency contact sharing, location check-ins, and 24/7 safety monitoring. Your online dating safety is our top priority.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Cultural Compatibility Matching</h4>
                <p className="text-slate-600 text-sm">Our AI algorithm considers Indian cultural values, family expectations, religious preferences, and regional backgrounds for better compatibility.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ad — between hero and features */}
      <div className="py-4 bg-white flex justify-center">
        <React.Suspense fallback={<div className="h-24 w-full max-w-3xl bg-slate-100 animate-pulse rounded-lg" />}>
          <AdWrapper showUpgradeNudge>
            <BannerAd slot="1234567890" />
          </AdWrapper>
        </React.Suspense>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h3 className="text-primary-600 font-semibold tracking-wide uppercase mb-3">Why Elovia Love?</h3>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built for meaningful connections</h3>
            <p className="text-lg text-slate-600">We've designed our platform from the ground up to foster real, authentic conversations rather than endless swiping.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              { icon: Shield, title: "Verified Profiles", desc: "Every profile goes through a strict verification process. Say goodbye to catfishing and fake accounts.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Zap, title: "Smart Matching AI", desc: "Our advanced algorithm matches you based on your personality, values, and lifestyle preferences.", color: "text-primary-500", bg: "bg-primary-50" },
              { icon: MessageCircle, title: "Deep Conversations", desc: "Icebreaker prompts and intuitive chat features designed to spark meaningful dialogue immediately.", color: "text-pink-500", bg: "bg-pink-50" }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeIn} className="bg-slate-50 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety Section — Condensed for Conversion */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">India's Safest Space to Find Real Love</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We believe serious relationships are built on a foundation of trust. That's why Elovia Love is the first dating platform in India to prioritize manual verification and advanced safety tools over simple swiping.
                </p>
                
                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <div className="bg-primary-50 p-2 rounded-lg h-fit"><Shield className="text-primary-600" size={24} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">100% Identity Verification</h4>
                      <p className="text-slate-600 text-sm">Every profile is manually reviewed to prevent catfishing and scams.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-pink-50 p-2 rounded-lg h-fit"><HeartHandshake className="text-pink-600" size={24} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Serious Relationship Intent</h4>
                      <p className="text-slate-600 text-sm">Our community is built for those seeking life partners, not casual encounters.</p>
                    </div>
                  </div>
                </div>

                <Link to="/safety" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all">
                  Explore our Safety Hub <Zap size={18} />
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fm=webp&fit=crop" alt="Happy Couple" className="rounded-3xl shadow-xl mt-8" />
              <img src="https://images.unsplash.com/photo-1522851259500-2eac44e7cde2?w=600&auto=format&fm=webp&fit=crop" alt="Secure Dating" className="rounded-3xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section — SEO Internal Linking */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Love in Your City</h2>
            <p className="text-slate-400">Discover genuine singles across India's most vibrant metropolitan areas.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Ranchi'].map((city) => (
              <Link 
                key={city} 
                to={`/dating-in-${city.toLowerCase()}`}
                className="group relative h-48 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 hover:border-primary-500 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-slate-800 group-hover:bg-primary-900 transition-colors"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="mx-auto mb-2 text-primary-400 group-hover:scale-125 transition-transform" />
                  <span className="font-bold text-lg">{city}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/discover" className="text-sm text-slate-400 hover:text-white underline underline-offset-4">Browse all cities</Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Your journey to finding love, simplified.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative">
             {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-slate-200 via-primary-300 to-slate-200 z-0"></div>

            {[
              { icon: Users, step: "1", title: "Create Profile", desc: "Sign up and tell us about yourself, your interests, and what you're looking for." },
              { icon: Heart, step: "2", title: "Find Matches", desc: "Our AI curates daily matches that fit your specific preferences." },
              { icon: MapPin, step: "3", title: "Meet & Date", desc: "Connect online and plan your perfect first date safely." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center max-w-[280px]"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-primary-50 mb-6 relative group">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Success Stories</h2>
            <p className="text-lg text-slate-600">Real couples who found their spark here.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "I had given up on dating apps until I found Elovia Love. The quality of matches and conversations here is unmatched. We are getting married next month!",
                author: "Sarah & David",
                image: "https://images.unsplash.com/photo-1522851259500-2eac44e7cde2?w=500&auto=format&fm=webp&fit=crop"
              },
              {
                text: "The verification process made me feel so much safer. I met Alex within my first week and we hit it off instantly. Thank you for this amazing platform.",
                author: "Emily & Alex",
                image: "https://images.unsplash.com/photo-1543854589-9892c554e950?w=500&auto=format&fm=webp&fit=crop"
              },
              {
                text: "What I loved most were the icebreakers. It made starting that first conversation so easy. Now we've been together for 2 years and adopted a dog!",
                author: "Jessica & Michael",
                image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fm=webp&fit=crop"
              }
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50 p-8 rounded-3xl relative"
              >
                <Quote className="absolute top-6 right-8 text-primary-200 w-12 h-12" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />)}
                </div>
                <p className="text-slate-700 italic mb-8 relative z-10 leading-relaxed font-medium">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.author} loading="lazy" width="56" height="56" className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white" />
                  <div>
                    <h5 className="font-bold text-slate-900">{testimonial.author}</h5>
                    <p className="text-sm text-primary-600 font-medium">Matched 2024</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad — between testimonials and CTA */}
      <div className="py-4 bg-white flex justify-center">
        <React.Suspense fallback={<div className="h-24 w-full max-w-3xl bg-slate-100 animate-pulse rounded-lg" />}>
          <AdWrapper showUpgradeNudge>
            <BannerAd slot="1234567891" />
          </AdWrapper>
        </React.Suspense>
      </div>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">Everything you need to know about finding love on Elovia Love.</p>
          </motion.div>

          <React.Suspense fallback={<div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl" />}>
            <FAQAccordion faqs={[
              {
                question: "Is Elovia Love for serious relationships?",
                answer: "Yes, Elovia Love is specifically designed for singles seeking serious, long-term relationships. Unlike casual dating apps, we focus on meaningful connections and compatibility matching to help you find a partner who shares your values and life goals."
              },
              {
                question: "How does profile verification work?",
                answer: "Every profile on Elovia Love goes through a comprehensive verification process. Users must provide government-issued ID, complete a detailed questionnaire, and submit photos that are manually reviewed by our team. This ensures you're connecting with real people who are genuinely interested in relationships."
              },
              {
                question: "Is Elovia Love safe for online dating?",
                answer: "Safety is our top priority. We use bank-level encryption for all communications, provide advanced privacy controls, and offer safety tools like emergency contact sharing and location check-ins. Our verification process eliminates fake profiles, and we have a dedicated safety team that responds to reports within 24 hours."
              },
              {
                question: "How does the matching algorithm work?",
                answer: "Our AI-powered matching system considers multiple factors including your personality traits, values, lifestyle preferences, cultural background, and relationship goals. We go beyond surface-level matching to ensure compatibility that leads to lasting relationships."
              },
              {
                question: "Is Elovia Love free to use?",
                answer: "You can create a profile and browse matches for free. Premium features like unlimited messaging, advanced filters, and priority matching are available through our subscription plans. We believe in quality over quantity, so even our free features are designed to help you find meaningful connections."
              },
              {
                question: "What makes Elovia Love different from other dating apps?",
                answer: "Unlike casual dating apps focused on swiping and quick matches, Elovia Love is built for serious relationships. We verify every profile, use compatibility-based matching, and provide tools for meaningful conversations. Our platform is designed for Indian singles who want long-term partnerships rather than casual encounters."
              },
              {
                question: "How do I know if someone is verified?",
                answer: "Verified profiles display a blue checkmark badge next to their name. This badge indicates they've completed our verification process, including ID submission, photo review, and questionnaire completion. You can only match with verified users, ensuring authenticity."
              },
              {
                question: "What safety features does Elovia Love offer?",
                answer: "We offer comprehensive safety features including emergency contact sharing, location check-ins, photo verification, encrypted messaging, and a 24/7 safety team. You can also block/report suspicious users, and all profiles are manually reviewed before approval."
              },
              {
                question: "Can I use Elovia Love if I'm looking for marriage?",
                answer: "Absolutely. Many of our users are marriage-minded singles. Our matching algorithm considers relationship goals, and you can specify 'marriage' as your objective in your profile. We help connect people who share similar long-term aspirations."
              },
              {
                question: "How does Elovia Love handle cultural compatibility?",
                answer: "Our platform is designed with Indian cultural context in mind. We consider factors like family values, religious preferences, and cultural background in our matching algorithm. This helps create more compatible, lasting relationships within the Indian community."
              }
            ]} />
          </React.Suspense>
        </div>
      </section>

      {/* External Links Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Learn More About Dating & Relationships</h3>
          <p className="text-slate-600 mb-8">Read our expert insights and community discussions on trusted platforms.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://medium.com/@elovialove"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <span className="text-slate-700 font-medium">Medium</span>
            </a>
            <a
              href="https://www.quora.com/profile/Elovia-Love"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <span className="text-slate-700 font-medium">Quora</span>
            </a>
            <a
              href="https://www.reddit.com/r/elovialove/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <span className="text-slate-700 font-medium">Reddit</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-slate-900/50"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-white mb-6">Ready to Find Your Perfect Match on India's Best Dating App?</h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                Join thousands of verified Indian singles who are taking the stress out of online dating and focusing on real connections. Start your journey to finding love, meaningful relationships, and your life partner today.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-full font-bold text-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300"
              >
                Create Free Account
              </Link>
              <p className="mt-6 text-sm text-slate-400">It only takes 2 minutes to set up your profile.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
};

// Mini simple icon components for missing ones from standard lucide
function SparklesIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

export default Home;
