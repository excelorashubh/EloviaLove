import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL } from '../data/seoContent';

const DatingInBangalorePage = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <Helmet>
        <title>Dating in Bangalore | Meet Verified Singles in Bangalore | Elovia Love</title>
        <meta name="description" content="Connect with verified singles in Bangalore on Elovia Love. Find meaningful matches among the city's professionals and students." />
        <link rel="canonical" href={`${SITE_URL}/dating-in-bangalore`} />
        <meta property="og:title" content="Dating in Bangalore | Elovia Love" />
        <meta property="og:description" content="Connect with verified singles in Bangalore on Elovia Love." />
        <meta property="og:url" content={`${SITE_URL}/dating-in-bangalore`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Dating in Bangalore</h1>
      <p className="text-slate-700 mb-6">Bangalore's cosmopolitan culture creates opportunities for meaningful relationships — here are local tips.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Local Scenes & Tips</h2>
        <p className="text-slate-700">Choose public, well-known cafes and cultural events to meet new people; tech meetups can be a relaxed icebreaker.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <strong>Where are safe meetup spots in Bangalore?</strong>
            <p>Cafes, malls, and community events are great starting points — avoid isolated locations.</p>
          </div>
          <div>
            <strong>How are matches suggested?</strong>
            <p>Our matching algorithm recommends profiles based on preferences, interests, and compatibility.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/dating-in-kolkata" className="text-primary-600">See Dating in Kolkata →</Link>
        <Link to="/how-verification-works" className="text-slate-600">How Verification Works</Link>
      </div>

      <section className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to meet people in Bangalore?</h3>
        <Link to="/signup" className="inline-block bg-primary-600 text-white px-5 py-2 rounded-md">Create Your Profile</Link>
      </section>
    </div>
  );
};

export default DatingInBangalorePage;
