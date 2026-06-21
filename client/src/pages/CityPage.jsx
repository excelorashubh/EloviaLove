import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Heart, Shield, MapPin, Star, MessageCircle, Info } from 'lucide-react';

// Programmatic City Data
const CITY_DATA = {
  'delhi': {
    name: 'Delhi',
    title: 'Dating in Delhi | Find Serious Relationships in the Capital',
    description: 'Looking for real love in Delhi? Join Elovia Love, the most trusted dating app for Delhi singles seeking serious relationships and verified profiles.',
    culture: 'Delhi\'s dating scene is as vibrant and diverse as the city itself. From the historical charm of Old Delhi to the modern vibes of South Delhi, singles here value both tradition and contemporary connections.',
    dateIdeas: [
      'A romantic walk through Lodhi Gardens.',
      'Coffee and conversation at a cozy cafe in Hauz Khas Village.',
      'Exploring the art galleries of Mandi House.',
      'A sunset view from the terrace of a rooftop restaurant in CP.'
    ]
  },
  'mumbai': {
    name: 'Mumbai',
    title: 'Dating in Mumbai | Find Your Perfect Match in the City of Dreams',
    description: 'Connect with verified singles in Mumbai. Elovia Love helps Mumbaikars find meaningful connections and serious relationships safely.',
    culture: 'In the fast-paced life of Mumbai, meaningful connections are highly valued. Whether it\'s a stroll along Marine Drive or a quick meeting at a Bandra cafe, Mumbai singles are looking for partners who share their dreams and hustle.',
    dateIdeas: [
      'Watching the sunset at Marine Drive.',
      'A long walk at Juhu Beach.',
      'Dinner at a trendy restaurant in Bandra.',
      'A ferry ride to Elephanta Caves for a historical adventure.'
    ]
  },
  'bangalore': {
    name: 'Bangalore',
    title: 'Dating in Bangalore | Serious Relationships for the Silicon Valley of India',
    description: 'Looking for a compatible partner in Bangalore? Elovia Love uses AI-powered matching to connect Bangalore singles for lasting love.',
    culture: 'Bangalore\'s dating culture is heavily influenced by its tech-savvy, cosmopolitan population. Singles here often look for partners who share their professional ambitions as well as their love for weekend getaways and craft breweries.',
    dateIdeas: [
      'A morning walk at Lalbagh Botanical Garden.',
      'Trying local craft beers at a brewery in Indiranagar.',
      'Attending a live music gig at a venue in Koramangala.',
      'A quick drive to Nandi Hills for a sunrise view.'
    ]
  }
};

const CityPage = () => {
  const { city } = useParams();
  
  // Clean the city param (e.g., "dating-in-delhi" -> "delhi")
  const cityKey = useMemo(() => {
    if (!city) return '';
    return city.toLowerCase().replace('dating-in-', '');
  }, [city]);

  const data = CITY_DATA[cityKey] || {
    name: cityKey.charAt(0).toUpperCase() + cityKey.slice(1),
    title: `Dating in ${cityKey.charAt(0).toUpperCase() + cityKey.slice(1)} | Elovia Love`,
    description: `Join Elovia Love to find serious relationships and verified profiles in ${cityKey}.`,
    culture: `The dating scene in ${cityKey} is growing rapidly, with more singles looking for meaningful connections over casual encounters.`,
    dateIdeas: ['Visit a local park', 'Go for a coffee date', 'Explore a local museum']
  };

  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={`https://elovialove.onrender.com/dating-in-${cityKey}`} />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6"
            >
              <MapPin className="w-4 h-4" />
              Real Connections in {data.name}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6"
            >
              Find Real Love on India's #1 <span className="text-primary-600">Verified Dating App</span> in {data.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto mb-10"
            >
              Skip the small talk. Join thousands of verified singles in {data.name} who are looking for serious, long-term relationships and meaningful connections.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all"
              >
                Find Matches in {data.name} <Heart className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Dating Culture in {data.name}</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {data.culture}
                </p>
                <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                  <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-primary-600 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Elovia Insight</h4>
                      <p className="text-sm text-slate-600">Our AI algorithm suggests that singles in {data.name} are 40% more likely to look for verified profiles before initiating a conversation.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-primary-600/10 group-hover:bg-transparent transition-colors duration-300" />
                  <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fm=webp" alt="Dating" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden mt-8 relative group">
                   <div className="absolute inset-0 bg-pink-600/10 group-hover:bg-transparent transition-colors duration-300" />
                  <img src="https://images.unsplash.com/photo-1522851259500-2eac44e7cde2?w=400&auto=format&fm=webp" alt="Relationships" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Date Ideas Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Top First Date Ideas in {data.name}</h2>
            <p className="text-lg text-slate-600">Safe, fun, and romantic spots for your first Elovia Love date.</p>
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.dateIdeas.map((idea, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-slate-700 font-medium">{idea}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <Shield className="w-16 h-16 text-primary-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Safe Dating in {data.name}</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Your safety is our #1 priority. We verify every profile in {data.name} to ensure you\'re connecting with real people who are serious about finding love. No bots, no fakes, just genuine matches.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary-400 rounded-full" /> ID Verification</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary-400 rounded-full" /> Manual Review</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary-400 rounded-full" /> 24/7 Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-20 bg-slate-50 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to find love in {data.name}?</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/signup" className="px-8 py-4 bg-primary-600 text-white rounded-full font-bold shadow-lg hover:bg-primary-700 transition-colors">Create Free Profile</Link>
            <Link to="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors">Sign In</Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default CityPage;
