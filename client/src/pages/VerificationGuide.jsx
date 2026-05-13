import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { UserCheck, ShieldCheck, Camera, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';

const VerificationGuide = () => {
  const steps = [
    {
      title: "Government ID Submission",
      desc: "Upload a clear photo of your Aadhaar, PAN, or Voter ID. We use industry-leading encryption to keep your document safe and private.",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Selfie Verification",
      desc: "Take a live selfie within the app. Our AI compares this with your ID photo to ensure you are exactly who you say you are.",
      icon: Camera,
      color: "text-primary-600",
      bg: "bg-primary-50"
    },
    {
      title: "Manual Quality Check",
      desc: "Our moderation team manually reviews every verification request to ensure no fakes or bots enter our community.",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <>
      <Helmet>
        <title>How Verification Works | Elovia Love Safety</title>
        <meta name="description" content="Learn about Elovia Love's rigorous 3-step verification process. We combine AI and manual review to ensure 100% real profiles for serious dating in India." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <Navbar />

        <section className="pt-32 pb-20 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold mb-6"
            >
              <UserCheck className="w-4 h-4" /> 100% Genuine Profiles
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Our 3-Step Verification Process</h1>
            <p className="text-xl text-slate-600">We take your safety seriously. Here is how we ensure every profile on Elovia Love is verified and real.</p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative group">
                  <div className="absolute top-8 right-8 text-6xl font-black text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">0{idx + 1}</div>
                  <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mb-8`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why we require ID verification</h2>
              <ul className="space-y-4">
                {[
                  "Eliminates 99% of bots and scammers",
                  "Ensures serious relationship intent",
                  "Builds immediate trust between matches",
                  "Safe and secure data handling",
                  "Peace of mind for every user"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-primary-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-white/5 p-10 rounded-[4rem] border border-white/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">Your Privacy Matters</h3>
              <p className="text-slate-400 mb-8">
                Your ID documents are used **only** for verification. They are never shown to other users and are stored in a siloed, encrypted environment that even our general support staff cannot access.
              </p>
              <Link to="/privacy" className="text-primary-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Read our Privacy Policy <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default VerificationGuide;
