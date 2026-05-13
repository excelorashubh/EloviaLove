import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, UserCheck, MessageSquare, PhoneCall } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const SafetyHub = () => {
  const safetyResources = [
    {
      title: "Profile Verification",
      desc: "Learn how we use government ID and photo validation to keep our community real.",
      icon: UserCheck,
      link: "/how-verification-works",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Online Dating Safety India",
      desc: "Specific advice for staying safe in the Indian dating landscape.",
      icon: Shield,
      link: "/online-dating-safety-india",
      color: "text-primary-600",
      bg: "bg-primary-50"
    },
    {
      title: "Reporting & Blocking",
      desc: "How to instantly report suspicious behavior and maintain your peace of mind.",
      icon: AlertTriangle,
      link: "/report-abuse",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Data Privacy",
      desc: "Our commitment to protecting your personal information with bank-level encryption.",
      icon: Lock,
      link: "/privacy",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  const safetyTips = [
    {
      title: "Stay on the Platform",
      text: "Keep your conversations within Elovia Love until you've met in person and built trust. Our secure messaging protects your identity."
    },
    {
      title: "Protect Personal Info",
      text: "Never share your Aadhaar number, bank details, or home address with someone you've only just met online."
    },
    {
      title: "Meet in Public",
      text: "For your first few dates, always meet in well-lit, public spaces like cafes or malls. Tell a friend where you're going."
    },
    {
      title: "Trust Your Gut",
      text: "If something feels off, it probably is. You are never obligated to continue a conversation or a date."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Trust & Safety Center | Elovia Love India</title>
        <meta name="description" content="Your safety is our #1 priority. Explore Elovia Love's comprehensive safety features, verification guides, and expert advice for secure online dating in India." />
        <link rel="canonical" href="https://elovialove.onrender.com/safety" />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/20"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            >
              Your Safety is Our <span className="text-primary-400">#1 Priority</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              At Elovia Love, we are dedicated to creating the safest dating environment in India. Through advanced technology and human oversight, we ensure your journey to finding love is secure.
            </motion.p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-20 -mt-10 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safetyResources.map((res, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={res.link}
                    className="group block bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    <div className={`w-14 h-14 ${res.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <res.icon className={`w-7 h-7 ${res.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{res.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{res.desc}</p>
                    <span className="text-primary-600 font-bold text-sm flex items-center gap-1">
                      Learn More <CheckCircle className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Safety Tips */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Dating Safety Tips</h2>
              <p className="text-lg text-slate-600">Essential guidelines for a safe and positive dating experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyTips.map((tip, idx) => (
                <div key={idx} className="flex gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <span className="text-primary-600 font-bold text-xl">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{tip.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Highlight */}
        <section className="py-24 bg-primary-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
            <UserCheck className="w-16 h-16 mx-auto mb-8 opacity-80" />
            <h2 className="text-3xl md:text-5xl font-bold mb-8">100% Verified Community</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Every profile on Elovia Love undergoes a rigorous verification process. Look for the blue checkmark to ensure you're connecting with genuine people.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to="/how-verification-works" className="px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all">How it Works</Link>
              <Link to="/signup" className="px-10 py-5 bg-primary-800 text-white rounded-full font-bold text-lg hover:bg-primary-900 transition-all">Get Verified Now</Link>
            </div>
          </div>
        </section>

        {/* Reporting Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">See Something Suspicious?</h2>
            <p className="text-lg text-slate-600 mb-10">
              We have a zero-tolerance policy for harassment, fake profiles, and scams. Our 24/7 moderation team is here to help.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border border-slate-200 rounded-3xl">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold mb-2">Report in App</h4>
                <p className="text-sm text-slate-500">Tap the "Report" button on any profile or chat screen.</p>
              </div>
              <div className="p-6 border border-slate-200 rounded-3xl">
                <PhoneCall className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold mb-2">Contact Support</h4>
                <p className="text-sm text-slate-500">Email us at safety@elovialove.onrender.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SafetyHub;
