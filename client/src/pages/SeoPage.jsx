import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ALL_SEO_PAGES, SITE_URL } from '../data/seoContent';

const SeoPage = ({ slug }) => {
  const page = ALL_SEO_PAGES[slug];
  const url = `${SITE_URL}/${slug}`;

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Helmet>
          <title>Page Not Found | Elovia Love</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Page not found</h1>
          <p className="text-slate-600 mb-6">The page you are looking for does not exist or may have moved.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={page.ogImage || `${SITE_URL}/EloviaLoveWB_small.png`} />
        <meta property="og:site_name" content="Elovia Love" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
        <meta name="twitter:image" content={page.ogImage || `${SITE_URL}/EloviaLoveWB_small.png`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <Link to="/" className="text-primary-600 hover:text-primary-700">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-500">{page.h1}</span>
        </nav>

        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-primary-600 mb-3">Elovia Love SEO Content</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            {page.h1}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">{page.intro}</p>
        </header>

        <article className="space-y-12">
          {page.faqs ? (
            <section className="space-y-8">
              {page.sections?.map((section, index) => (
                <div key={index}>
                  {section.title && <h2 className="text-2xl font-semibold text-slate-900 mb-4">{section.title}</h2>}
                  {section.body?.map((paragraph, idx) => (
                    <p key={idx} className="text-slate-600 leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>
              ))}
              <div className="space-y-6">
                {page.faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            page.sections?.map((section, index) => (
              <section key={index} className="space-y-5">
                {section.title && <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>}
                {section.body?.map((paragraph, idx) => (
                  <p key={idx} className="text-slate-600 leading-relaxed">{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="mt-4 space-y-2 list-disc list-inside text-slate-600">
                    {section.list.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}

          {page.relatedLinks && (
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Explore related pages</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {page.relatedLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.url}
                    className="block rounded-2xl border border-slate-200 p-5 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{link.title}</p>
                    <p className="text-sm text-slate-500">Learn more about this topic.</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {page.cta && (
            <section className="rounded-3xl border border-primary-200 bg-gradient-to-r from-primary-50 to-pink-50 p-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{page.cta.heading}</h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-6">{page.cta.text}</p>
              <Link
                to={page.cta.buttonUrl}
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                {page.cta.buttonText}
              </Link>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default SeoPage;
