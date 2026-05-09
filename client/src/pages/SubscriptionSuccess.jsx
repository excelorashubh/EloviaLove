import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Crown, Heart } from 'lucide-react';

const SubscriptionSuccess = () => (
  <>
    <Helmet>
      <title>Subscription Confirmed — Elovia Love</title>
      <meta name="description" content="Your subscription purchase was successful. Enjoy premium features on Elovia Love." />
      <link rel="canonical" href="https://elovialove.onrender.com/subscription/success" />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
        <Crown size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">You're Premium!</h1>
      <p className="text-slate-500 mb-8">Your subscription is now active. Enjoy all premium features on Elovia Love.</p>
      <div className="space-y-3">
        <Link
          to="/discover"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/40 transition-all"
        >
          <Heart size={18} fill="currentColor" /> Start Discovering
        </Link>
        <Link to="/dashboard" className="block w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-2xl hover:bg-slate-50 transition-all">
          Go to Dashboard
        </Link>
      </div>
    </motion.div>
  </div>
  </>
);

export default SubscriptionSuccess;
