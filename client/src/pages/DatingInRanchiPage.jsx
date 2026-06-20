import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DatingInRanchiPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in Ranchi | Meet Verified Singles in Ranchi | Elovia Love</title>
        <meta name="description" content="Connect with verified singles in Ranchi on Elovia Love. Safe meetups and local community tips." />
        <link rel="canonical" href="https://elovialove.com/dating-in-ranchi" />
        <meta property="og:title" content="Dating in Ranchi | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles in Ranchi on Elovia Love." />
        <meta property="og:url" content="https://elovialove.com/dating-in-ranchi" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in Ranchi</h1>
      <p className="text-slate-700 mb-6">Smaller-city dynamics make Ranchi great for close-knit community connections.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Local Scenes & Tips</h2>
        <p className="text-slate-700">Attend community events and choose public meeting spots for safety.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>How do I meet locals?</strong>
            <p>Use search filters to narrow by city and interests; join events and conversation groups.</p>
          </div>
          <div>
            <strong>Who moderates reports?</strong>
            <p>Our moderation team reviews in-app reports and takes action per our community guidelines.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/dating-in-india" className="text-primary-600">Back to Dating in India →</Link>
        <Link to="/faq" className="text-slate-600">FAQ</Link>
      </div>

      <section className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to meet people in Ranchi?</h3>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Create Your Profile</Link>
      </section>
    </div>
  );
};

export default DatingInRanchiPage;
