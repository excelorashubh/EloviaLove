import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL } from '../data/seoContent';

const DatingInMumbaiPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in Mumbai | Meet Verified Singles in Mumbai | Elovia Love</title>
        <meta name="description" content="Connect with verified singles in Mumbai on Elovia Love. Discover meaningful relationships and local meeting tips." />
        <link rel="canonical" href={`${SITE_URL}/dating-in-mumbai`} />
        <meta property="og:title" content="Dating in Mumbai | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles in Mumbai on Elovia Love." />
        <meta property="og:url" content={`${SITE_URL}/dating-in-mumbai`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in Mumbai</h1>
      <p className="text-slate-700 mb-6">Mumbai's fast-paced lifestyle still makes room for meaningful connections — here's how to find them safely.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Local Scenes & Tips</h2>
        <p className="text-slate-700">From Bandra cafes to South Mumbai cultural spaces, choose public venues and let friends know your plans.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>How do I adjust search radius in Mumbai?</strong>
            <p>Use the location filter on the Discover page to focus on specific neighborhoods.</p>
          </div>
          <div>
            <strong>Are there meetups or events?</strong>
            <p>Check our blog for local events and community gatherings.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/dating-in-bangalore" className="text-primary-600">See Dating in Bangalore →</Link>
        <Link to="/blog" className="text-slate-600">Blog</Link>
      </div>

      <section className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to meet people in Mumbai?</h3>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Create Your Profile</Link>
      </section>
    </div>
  );
};

export default DatingInMumbaiPage;
