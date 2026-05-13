import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Coffee, MapPin, Phone, ShieldCheck, Heart, UserCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';

const SafeFirstDates = () => {
  const tips = [
    {
      title: "Choose a Public Venue",
      desc: "Meet in a busy, well-lit place like a popular cafe, restaurant, or shopping mall. Never agree to meet at a private home or hotel room for the first time.",
      icon: Coffee
    },
    {
      title: "Tell Someone Your Plans",
      desc: "Share your date details and live location with a friend or family member. Let them know when the date starts and when you expect to be home.",
      icon: Phone
    },
    {
      title: "Arrange Your Own Transport",
      desc: "Be in control of how you get to and from the date. Don't let your date pick you up or drop you off at your home for the first few meetings.",
      icon: MapPin
    },
    {
      title: "Stay Clear-Headed",
      desc: "Avoid excessive alcohol during the first meeting. Keeping your wits about you is essential for staying safe and observant.",
      icon: ShieldCheck
    }
  ];

  return (
    <>
      <Helmet>
        <title>Safe First Date Tips | Elovia Love Safety</title>
        <meta name="description" content="Expert advice for your first offline meeting. Learn how to stay safe, set boundaries, and have a positive first date experience." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <Navbar />

        <section className="pt-32 pb-20 bg-gradient-to-r from-pink-500 to-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-6"
            >
              <Heart className="w-4 h-4" /> Your Safety First
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Safe First Date Tips</h1>
            <p className="text-xl text-white/80">Taking your connection offline should be exciting and safe. Follow our essential guide for your first meeting.</p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tips.map((tip, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex gap-6 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center shrink-0">
                    <tip.icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{tip.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
               <UserCheck className="w-16 h-16 text-primary-400 mx-auto mb-6" />
               <h2 className="text-3xl font-bold mb-6">Trust Your Gut</h2>
               <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                 You are in control. If at any point you feel uncomfortable or pressured, you have the right to end the date and leave. You don't owe anyone an explanation for prioritizing your safety.
               </p>
               <Link to="/safety" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-all">
                 View All Safety Resources
               </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SafeFirstDates;
