import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Shield, Flag, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportAbuse = () => {
  return (
    <>
      <Helmet>
        <title>Report Abuse & Safety Concerns | Elovia Love</title>
        <meta name="description" content="Report any suspicious behavior, harassment, or fake profiles. Our 24/7 moderation team is here to ensure a safe dating experience for everyone." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">

        <section className="pt-32 pb-20 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Report a Safety Concern</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We have a zero-tolerance policy for harassment, fake profiles, and scams. Your reports help us keep Elovia Love safe for everyone.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900">How to Report</h2>
                <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Flag className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">In-App Reporting</h4>
                    <p className="text-slate-600 text-sm">Tap the three dots (...) on any profile or within a chat and select "Report User".</p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email Our Team</h4>
                    <p className="text-slate-600 text-sm">Send an email to safety@elovialove.onrender.com with details and screenshots.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 text-white">
                <Shield className="w-12 h-12 text-primary-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
                <ul className="space-y-4">
                  {[
                    "Immediate manual review by our moderation team.",
                    "The reported user will not be notified of who reported them.",
                    "If a violation is found, the account will be permanently banned.",
                    "You will receive an update once the investigation is complete."
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReportAbuse;
