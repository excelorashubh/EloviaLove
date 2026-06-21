import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Shield, MapPin, AlertCircle, CheckCircle, Heart, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const DatingSafetyIndia = () => {
  const safetyTips = [
    {
      title: "Public Meetings",
      desc: "For your first few meetings, always choose high-traffic public locations like popular malls, well-known cafes, or busy public parks. Avoid meeting in private or secluded areas.",
      icon: MapPin
    },
    {
      title: "Stay on Elovia Love",
      desc: "Keep your conversations within our encrypted chat. Scammers often try to move the conversation to other platforms quickly to avoid our safety filters.",
      icon: Shield
    },
    {
      title: "Tell a Friend",
      desc: "Always inform a trusted friend or family member about your date plans. Share your live location with them via your phone during the meeting.",
      icon: Phone
    },
    {
      title: "Trust Your Intuition",
      desc: "If something feels off during your conversation or meeting, don't hesitate to leave. Your safety and comfort are far more important than politeness.",
      icon: Heart
    }
  ];

  return (
    <>
      <Helmet>
        <title>Online Dating Safety in India | Elovia Love Guide</title>
        <meta name="description" content="A comprehensive guide to staying safe while online dating in India. Expert tips on verification, public meetings, and protecting your personal information." />
        <link rel="canonical" href="https://elovialove.onrender.com/online-dating-safety-india" />
      </Helmet>

      <div className="bg-slate-900 min-h-screen text-slate-100">

        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold mb-6"
            >
              <Shield className="w-4 h-4" /> Indian Dating Safety Guide
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Staying Safe in the <span className="text-primary-500">Indian Dating Scene</span></h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Dating in India comes with unique cultural nuances. Our guide helps you navigate the digital matchmaking world with confidence and security.
            </p>
          </div>
        </section>

        {/* Essential Tips Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyTips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-700 hover:border-primary-500/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
                    <tip.icon className="w-7 h-7 text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{tip.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{tip.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Safety Section */}
        <section className="py-20 bg-slate-800/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-800 p-10 md:p-16 rounded-[4rem] border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <AlertCircle className="w-12 h-12 text-primary-500 mb-6" />
                <h2 className="text-3xl font-bold mb-6">Financial Safety & Scams</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  Never share your **UPI details, bank account numbers, or OTPs** with anyone you meet on a dating app. In India, scammers often create elaborate stories about family emergencies or being stuck at customs to ask for money. 
                </p>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-sm font-semibold text-primary-400 mb-2 uppercase tracking-wider">Golden Rule</p>
                  <p className="text-slate-300 italic">"Real love never starts with a request for money."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Blue Checkmark Advantage</h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                On Elovia Love, we manually verify every profile using government ID. When you see a blue checkmark, it means that person is **exactly** who they claim to be.
              </p>
              <div className="space-y-4">
                {["100% ID Verified", "Live Selfie Matching", "Manual Moderation", "No Bots Allowed"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
               <div className="aspect-square bg-gradient-to-br from-primary-600 to-pink-600 rounded-[4rem] flex items-center justify-center p-1 shadow-2xl">
                  <div className="w-full h-full bg-slate-900 rounded-[3.8rem] flex flex-col items-center justify-center text-center p-12">
                     <Shield className="w-20 h-20 text-primary-500 mb-6 animate-pulse" />
                     <h4 className="text-2xl font-bold mb-2">Secure Ecosystem</h4>
                     <p className="text-slate-500">End-to-end encrypted chats and siloed data storage.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Safe dating starts with a verified profile</h2>
            <p className="text-lg text-slate-400 mb-10">Join Elovia Love today and experience the safest digital matchmaking in India.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/signup" className="px-10 py-4 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20">Get Started Free</Link>
              <Link to="/safety" className="px-10 py-4 bg-slate-700 text-white rounded-full font-bold hover:bg-slate-600 transition-all">Visit Safety Hub</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DatingSafetyIndia;
