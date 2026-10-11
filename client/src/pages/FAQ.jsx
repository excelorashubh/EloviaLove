import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, CircleHelp, ShieldCheck, Sparkles } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';

const questions = [
  {
    question: 'How do I create an account?',
    answer: 'Sign up with your name, email, phone number, date of birth, and a few profile details. You must be age 18 or older. Complete your profile with photos and interests to improve match quality and platform trust.'
  },
  {
    question: 'How does profile verification work?',
    answer: 'Verification is intended to help confirm that a user is genuine and reduce fraud risk. It may involve photo or identity checks depending on the feature configured by the platform. Verification is an important safety signal, but it does not replace your own judgment when interacting with others.'
  },
  {
    question: 'How do I find matches?',
    answer: 'Use the matching and discovery tools to set preferences, browse suggested profiles, and engage with people who align with your interests and relationship goals. You can also use filters and messaging features to begin respectful conversations.'
  },
  {
    question: 'Can I block or report a user?',
    answer: 'Yes. If someone is abusive, suspicious, or violates community guidelines, you can use the report and block tools available on the platform. Blocking and reporting help protect your safety and support moderation actions.'
  },
  {
    question: 'How do I start a video call?',
    answer: 'Video calls require the appropriate membership or coin balance depending on the configured product flow. If you have enough coins or access, the app will show the option to start a call from the relevant profile or chat flow.'
  },
  {
    question: 'What are premium features?',
    answer: 'Premium access may include extra filters, priority visibility, advanced matching preferences, and other features shown on the pricing page. The specific benefits depend on the active plan configuration.'
  },
  {
    question: 'How are subscriptions billed?',
    answer: 'Subscriptions are billed according to the selected plan and payment settings. Renewal terms are shown during checkout and in the app. The billing provider may handle recurring renewals, one-time charges, or plan changes according to the approved configuration.'
  },
  {
    question: 'What is the coin-to-minute conversion?',
    answer: 'The current platform conversion is 100 coins = 1 minute of video-call time. Example conversions include 200 coins for 2 minutes, 500 coins for 5 minutes, and 1,000 coins for 10 minutes. Final pricing and bundle availability are shown before purchase.'
  },
  {
    question: 'How do I cancel a subscription?',
    answer: 'You can cancel future renewals from your account settings or by contacting support. Cancellation timing depends on the active billing cycle and provider rules. The platform will stop future billing on the next renewal where the provider confirms the cancellation.'
  },
  {
    question: 'How do I request a refund?',
    answer: 'Submit a refund request through the support channel with your account email, payment reference, and a short description. We review each request based on the active refund policy, payment status, account history, and any provider or authorization review required.'
  },
  {
    question: 'How do I delete my account?',
    answer: 'Use the account settings area or contact support to request account deletion. We may retain required records for moderation, legal obligations, or billing review after deletion, where allowed by law.'
  }
];

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ | Elovia Love</title>
        <meta name="description" content="Find answers about account creation, matches, subscriptions, refunds, safety, and support on Elovia Love." />
        <link rel="canonical" href={`${SITE_URL}/faq`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 px-4 py-24 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 rounded-[2rem] border border-rose-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-5 inline-flex rounded-2xl bg-rose-50 p-3 text-rose-600">
              <CircleHelp size={24} />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Frequently asked questions</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">FAQ</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              Everything you need to know about using Elovia Love safely, responsibly, and transparently.
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((item) => (
              <div key={item.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-rose-50 p-2 text-rose-600">
                    <ChevronRight size={18} />
                  </div>
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-slate-900">{item.question}</h2>
                    <p className="text-base leading-7 text-slate-600">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3 text-slate-900">
              <ShieldCheck className="text-rose-600" size={22} />
              <h2 className="text-2xl font-bold">Need more help?</h2>
            </div>
            <p className="mb-5 text-slate-600">
              Visit the safety hub, review our privacy policy and terms, or contact the support desk if you need guidance about reporting, subscriptions, or account issues.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/safety" className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">Safety hub</Link>
              <Link to="/contact" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">Contact support</Link>
              <Link to="/pricing" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">Pricing</Link>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
            <Sparkles size={16} className="text-rose-500" />
            <span>Policies and plans may be reviewed and updated as product and compliance settings change.</span>
          </div>
        </div>
      </div>
    </>
  );
}
