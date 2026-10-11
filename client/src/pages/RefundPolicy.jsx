import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, CreditCard, ShieldCheck, TimerReset } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { legalConfig } from '../data/legalContent';

const sections = [
  {
    title: 'Subscription plans and billing',
    content:
      'Elovia Love offers premium membership plans and optional additional services from time to time. Subscription details, pricing, renewals, and any taxes are shown on the pricing page and may change with notice. Plans are activated immediately after successful payment unless a provider-specific rule applies.'
  },
  {
    title: 'How cancellation works',
    content:
      'You may cancel renewal or switch off automatic renewal from your account subscription settings or by contacting support. Cancellation stops future billing on the next billing cycle unless the payment provider confirms a different renewal action. A paid period already consumed is generally not refunded unless the refund policy below or a provider rule says otherwise.'
  },
  {
    title: 'Refund eligibility',
    content:
      'Refunds are reviewed case by case. We do not promise automatic refunds for all purchases. Legitimate refund requests are reviewed based on service usage, payment status, duplicate charges, provider confirmation, and account standing. If a payment was not authorized by you, it must be reported immediately through the support contact and we will coordinate with the payment provider.'
  },
  {
    title: 'Video-call coins',
    content:
      'Coins are purchased for video-call usage on the platform. The conversion used by Elovia Love is 100 coins = 1 minute of call time. Coins are deducted when a call begins or as otherwise configured in the platform logic and billing system. Incomplete, failed, or interrupted calls may be reviewed for credit where platform errors or duplicate billing are confirmed.'
  },
  {
    title: 'Unused coins and disputes',
    content:
      'Unused coins may be considered for review if a purchase is duplicated, charged incorrectly, or if the account was suspended or deleted before the purchased value was used. Not all incorrect or disputed charges are automatically refundable. Any refund request should include payment reference, date, amount, and the issue observed.'
  },
  {
    title: 'Support and requests',
    content:
      'To request a refund, cancel a renewal, dispute a charge, or ask about a duplicate payment, contact support at support@elovialove.com with your account email, transaction ID, and a short description of the issue. We may request additional verification before approving a refund request.'
  }
];

const highlights = [
  { icon: BadgeDollarSign, title: 'Transparent plans', text: 'View current subscription pricing, coin bundles, and billing details on the pricing page before checkout.' },
  { icon: CreditCard, title: 'Strict review', text: 'Duplicate payments, unauthorized charges, and account-level issues are reviewed with the payment provider when needed.' },
  { icon: TimerReset, title: 'Renewal control', text: 'Users can cancel future renewals through account settings or support, subject to active service period rules.' },
  { icon: ShieldCheck, title: 'Business-owner config', text: 'The exact approval threshold, refund exceptions, and gateway status should be reviewed by the business owner.' }
];

export default function RefundPolicy() {
  return (
    <>
      <Helmet>
        <title>Refund and Cancellation Policy | Elovia Love</title>
        <meta name="description" content="Review Elovia Love's refund and cancellation policy for memberships, video-call coins, billing disputes, and support requests." />
        <link rel="canonical" href={`${SITE_URL}/refund-policy`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 px-4 py-24 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 rounded-[2rem] border border-rose-100 bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Refunds & cancellations</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Refund and Cancellation Policy</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              This policy explains how premium subscriptions, renewals, and purchased video-call coins are handled at {legalConfig.businessName}. The exact rules should remain aligned with the active payment-provider setup and the business-owner approval settings.
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
                <p className="text-base leading-7 text-slate-600">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-rose-100 bg-rose-50 p-6 sm:p-8">
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Need help with a refund or billing issue?</h2>
            <p className="mb-5 text-slate-700">
              Contact {legalConfig.businessName} support and include your account email, payment reference, date of purchase, and the reason for your request. We review each request carefully and may request additional information before approving a refund.
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
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Review current pricing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
