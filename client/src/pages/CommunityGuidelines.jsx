import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Heart, Shield, Users, MessageSquare, HandMetal, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const CommunityGuidelines = () => {
  const guidelines = [
    {
      title: "Be Respectful",
      desc: "Treat everyone with kindness and respect. Harassment, hate speech, and bullying have no place on Elovia Love.",
      icon: Heart
    },
    {
      title: "Be Genuine",
      desc: "Use your real name and photos. Do not impersonate others or create multiple accounts.",
      icon: Users
    },
    {
      title: "Stay Safe",
      desc: "Protect your personal information and never share financial details with other members.",
      icon: Shield
    },
    {
      title: "Communicate Clearly",
      desc: "Be honest about your intentions and respect the boundaries of others in every conversation.",
      icon: MessageSquare
    }
  ];

  return (
    <>
      <Helmet>
        <title>Community Guidelines | Elovia Love</title>
        <meta name="description" content="Our guidelines ensure a safe, respectful, and genuine environment for everyone seeking serious relationships on Elovia Love." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <Navbar />

        <section className="pt-32 pb-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <HandMetal className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold mb-6">Our Community Guidelines</h1>
            <p className="text-xl text-white/80">Help us maintain a high-trust community built on respect and authenticity.</p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {guidelines.map((g, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex gap-6">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                    <g.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{g.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Why these rules matter</h2>
            <div className="space-y-4 text-left inline-block">
              {[
                "We want everyone to feel comfortable being themselves.",
                "Authenticity leads to better, long-lasting matches.",
                "Safety is the foundation of any meaningful connection.",
                "A respectful community is a thriving community."
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <Check className="w-5 h-5 text-green-500 shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CommunityGuidelines;
