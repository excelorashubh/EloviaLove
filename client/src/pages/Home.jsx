import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, Shield, Zap, MessageCircle, MapPin, Users, HeartHandshake, Quote } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import BannerAd from '../components/ads/BannerAd';

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
    <div className="overflow-hidden">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
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
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-pink-500">Perfect Match</span> Today
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            Join a community of singles who are ready to find genuine love. Meaningful conversations start here.
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
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
              ].map((src, idx) => (
                <img key={idx} className="w-12 h-12 rounded-full border-4 border-white object-cover" src={src} alt="User" />
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

      {/* Ad — between hero and features */}
      <div className="py-4 bg-white flex justify-center">
        <BannerAd slot="1234567890" />
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
            <h2 className="text-primary-600 font-semibold tracking-wide uppercase mb-3">Why EloviaLove?</h2>
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
                text: "I had given up on dating apps until I found EloviaLove. The quality of matches and conversations here is unmatched. We are getting married next month!",
                author: "Sarah & David",
                image: "https://images.unsplash.com/photo-1522851259500-2eac44e7cde2?w=500&auto=format&fit=crop"
              },
              {
                text: "The verification process made me feel so much safer. I met Alex within my first week and we hit it off instantly. Thank you for this amazing platform.",
                author: "Emily & Alex",
                image: "https://images.unsplash.com/photo-1543854589-9892c554e950?w=500&auto=format&fit=crop"
              },
              {
                text: "What I loved most were the icebreakers. It made starting that first conversation so easy. Now we've been together for 2 years and adopted a dog!",
                author: "Jessica & Michael",
                image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fit=crop"
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
                  <img src={testimonial.image} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white" />
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
        <BannerAd slot="1234567891" />
      </div>

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
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to find your Elovia?</h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                Join thousands of singles who are taking the stress out of dating and focusing on real connections.
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
