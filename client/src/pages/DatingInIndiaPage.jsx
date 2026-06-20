import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DatingInIndiaPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in India | Find Verified Singles Across India | Elovia Love</title>
        <meta name="description" content="Connect with verified singles across India on Elovia Love. Discover meaningful relationships, local meetups, and safety-first dating resources." />
        <link rel="canonical" href="https://elovialove.com/dating-in-india" />
        <meta property="og:title" content="Dating in India | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles across India on Elovia Love." />
        <meta property="og:url" content="https://elovialove.com/dating-in-india" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in India</h1>
      <p className="text-slate-700 mb-6">Explore local communities, safety tips, and events across India's major cities.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">Popular Cities</h2>
        <ul className="list-disc pl-6 text-slate-700">
          <li><Link to="/dating-in-delhi" className="text-primary-600">Delhi</Link></li>
          <li><Link to="/dating-in-mumbai" className="text-primary-600">Mumbai</Link></li>
          <li><Link to="/dating-in-bangalore" className="text-primary-600">Bangalore</Link></li>
          <li><Link to="/dating-in-kolkata" className="text-primary-600">Kolkata</Link></li>
          <li><Link to="/dating-in-ranchi" className="text-primary-600">Ranchi</Link></li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">How We Keep You Safe</h2>
        <p className="text-slate-700">Elovia Love uses identity verification, in-app reporting, and moderation to ensure meaningful, secure connections.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>How do I meet people in my city?</strong>
            <p>Set your location, browse local profiles, and use our messaging tools to start conversations.</p>
          </div>
          <div>
            <strong>Are profiles verified?</strong>
            <p>Yes — look for the verified badge on profiles that completed the verification process.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
        <p className="text-slate-700 mb-4">Create a profile, verify your identity, and meet people near you.</p>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Sign Up</Link>
      </section>
    </div>
  );
};

export default DatingInIndiaPage;
