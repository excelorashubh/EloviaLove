import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, UserRoundCheck, Scale, Sparkles } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { legalConfig } from '../data/legalContent';

const sections = [
  {
    title: '1. Acceptance of terms',
    text: 'By creating an account, using any part of Elovia Love, or purchasing a subscription or coin bundle, you confirm that you have read, understood, and agree to these Terms of Service. If you do not agree, you must not use the platform.'
  },
  {
    title: '2. Eligibility and account accuracy',
    text: 'You must be at least 18 years old to use Elovia Love. You agree to provide accurate information when creating your profile, updating your account, and using any service. Misrepresentation, fake accounts, impersonation, or identity fraud may lead to warnings, account restrictions, or permanent removal.'
  },
  {
    title: '3. Verification and profile integrity',
    text: 'Elovia Love may offer verification features, identity checks, or profile moderation tools to reduce fake profiles and enhance safety. Verification does not guarantee that every user is safe, truthful in all matters, or a suitable match, and it does not replace your own judgment when interacting with other people.'
  },
  {
    title: '4. Messaging, matches, subscriptions, and video calls',
    text: 'The platform allows users to connect, search for matches, send messages, and use paid video-call features. You agree to use these features responsibly, in line with the community guidelines, safety rules, and platform policies. Premium or paid features remain subject to the current pricing, feature availability, and subscription terms shown on the platform.'
  },
  {
    title: '5. Prohibited conduct',
    text: 'You may not use the platform to harass, threaten, blackmail, defraud, spam, impersonate, manipulate, or exploit other users. Prohibited activities include fake profiles, scam attempts, sexual harassment, abusive messages, coercive behavior, sharing explicit or non-consensual content, or any conduct that violates legal requirements or civil standards.'
  },
  {
    title: '6. Payments, billing, and coin purchases',
    text: 'Subscription plans and coin bundles are subject to the current pricing page and the payment provider configuration. Billing may be recurring or one-time depending on the selected offering. You are responsible for ensuring that your payment details are valid and authorized. Charges must be reviewed against the active provider and account settings.'
  },
  {
    title: '7. Refunds, cancellations, and disputes',
    text: 'Refunds and cancellation requests are reviewed under the Refund and Cancellation Policy and may depend on the service already used, provider rules, duplicate-payment review, and any business-owner approval settings. We reserve the right to decline requests that do not meet the policy or payment-provider rules.'
  },
  {
    title: '8. Moderation, suspension, and termination',
    text: 'We may review, restrict, temporarily suspend, or permanently remove an account if there is credible evidence of policy violations, fraud, safety issues, abusive behavior, or illegal activity. We may also take steps to protect the platform, other users, or compliance requirements.'
  },
  {
    title: '9. Content and intellectual property',
    text: `You retain ownership of the content you upload to the platform, but you grant ${legalConfig.businessName} a license to host, process, display, and moderate that content as needed to operate the platform. You may not upload content that infringes third-party rights or includes unlawful, explicit, harmful, or abusive material.`
  },
  {
    title: '10. Limitation of liability and governing law',
    text: 'Elovia Love is provided on an “as is” basis for the purpose of facilitating social connection and relationship discovery. We do not guarantee success, safety, or long-term outcomes from any match or date. To the extent permitted by law, our liability for losses is limited and this service is governed by the laws of India, subject to disputes being handled through the appropriate forum and legal process.'
  }
];

const highlights = [
  { icon: UserRoundCheck, title: 'Eligibility', text: 'Only adults aged 18+ may create and operate an account.' },
  { icon: ShieldAlert, title: 'User safety', text: 'Fake profiles, harassment, and scam behavior are not tolerated.' },
  { icon: Scale, title: 'Fair use', text: 'Users must comply with payment, moderation, and community rules.' },
  { icon: Sparkles, title: 'Service scope', text: 'The platform exists to support respectful dating and connection experiences.' }
];

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Elovia Love</title>
        <meta name="description" content="Read the Elovia Love terms of service covering eligibility, user responsibilities, payments, moderation, safety, and legal terms." />
        <link rel="canonical" href={`${SITE_URL}/terms`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 px-4 py-24 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 rounded-[2rem] border border-rose-100 bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Terms of service</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              These Terms of Service explain the responsibilities of users, the scope of platform services, and the operating rules of Elovia Love. These terms are designed to support safe and respectful community behavior, transparent payments, and clear moderation standards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Effective: {legalConfig.effectiveDate}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Last updated: {legalConfig.lastUpdated}</span>
            </div>
          </div>

          <div className="mb-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-rose-50 p-3 text-rose-600">
                  <Icon size={22} />
                </div>
                <h2 className="mb-2 text-lg font-bold text-slate-900">{title}</h2>
                <p className="text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-3 text-2xl font-bold text-slate-900">{section.title}</h2>
                <p className="text-base leading-7 text-slate-600">{section.text}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-rose-100 bg-rose-50 p-6 sm:p-8">
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Questions or concerns?</h2>
            <p className="mb-5 text-slate-700">
              If you need help understanding these terms, want to report a violation, or are seeking dispute support, contact our team through the support email or the contact form. We are committed to clear communication and fair moderation.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <a href={`mailto:${legalConfig.supportEmail}`} className="font-semibold text-rose-700 underline underline-offset-2">{legalConfig.supportEmail}</a>
              <span>•</span>
              <span>{legalConfig.supportPhone}</span>
              <span>•</span>
              <span>{legalConfig.supportHours}</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Contact support <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
