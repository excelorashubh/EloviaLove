import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL } from '../data/seoContent';

const DatingInDelhiPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in Delhi | Meet Verified Singles in Delhi | Elovia Love</title>
        <meta name="description" content="Connect with verified singles in Delhi on Elovia Love. Discover meaningful relationships, secure matching, and genuine connections." />
        <link rel="canonical" href={`${SITE_URL}/dating-in-delhi`} />
        <meta property="og:title" content="Dating in Delhi | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles in Delhi on Elovia Love." />
        <meta property="og:url" content={`${SITE_URL}/dating-in-delhi`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{`{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE_URL}/"},{"@type":"ListItem","position":2,"name":"Dating in India","item":"${SITE_URL}/dating-in-india"},{"@type":"ListItem","position":3,"name":"Delhi","item":"${SITE_URL}/dating-in-delhi"}]}`}</script>
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in Delhi</h1>
      <p className="text-slate-700 mb-6">Find verified singles across Delhi — from South Delhi neighborhoods to Central market meetups.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Local Scenes & Tips</h2>
        <p className="text-slate-700">Delhi's dating culture blends modern and traditional values; be open, respectful, and meet in public places for first meetings.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>Where should I meet for a first date in Delhi?</strong>
            <p>Choose busy public venues like Connaught Place cafes, Khan Market, or Hauz Khas Village.</p>
          </div>
          <div>
            <strong>How do I report suspicious behavior?</strong>
            <p>Use the in-app report button or visit our <Link to="/report-abuse" className="text-primary-600">Report Abuse</Link> page.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/dating-in-mumbai" className="text-primary-600">See Dating in Mumbai →</Link>
        <Link to="/faq" className="text-slate-600">FAQ</Link>
      </div>

      <section className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to meet people in Delhi?</h3>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Create Your Profile</Link>
      </section>
    </div>
  );
};

export default DatingInDelhiPage;
