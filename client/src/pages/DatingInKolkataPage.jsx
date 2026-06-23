import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL } from '../data/seoContent';

const DatingInKolkataPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in Kolkata | Meet Verified Singles in Kolkata | Elovia Love</title>
        <meta name="description" content="Connect with verified singles in Kolkata on Elovia Love. Explore cultural events and safe meeting tips." />
        <link rel="canonical" href={`${SITE_URL}/dating-in-kolkata`} />
        <meta property="og:title" content="Dating in Kolkata | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles in Kolkata on Elovia Love." />
        <meta property="og:url" content={`${SITE_URL}/dating-in-kolkata`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in Kolkata</h1>
      <p className="text-slate-700 mb-6">Kolkata's cultural scene is ideal for thoughtful conversations and meaningful meetups.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Local Scenes & Tips</h2>
        <p className="text-slate-700">Enjoy literary events, coffeehouses, and public parks for first meetings.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>Where can I find community events?</strong>
            <p>Check local listings and our blog for upcoming events and meetups.</p>
          </div>
          <div>
            <strong>How do I stay safe?</strong>
            <p>Meet in public spaces and use our in-app reporting tools if anything feels unsafe.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/dating-in-ranchi" className="text-primary-600">See Dating in Ranchi →</Link>
        <Link to="/community-guidelines" className="text-slate-600">Community Guidelines</Link>
      </div>

      <section className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to meet people in Kolkata?</h3>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Create Your Profile</Link>
      </section>
    </div>
  );
};

export default DatingInKolkataPage;
