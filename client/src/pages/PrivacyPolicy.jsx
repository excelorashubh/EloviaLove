import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, LockKeyhole, UserCog, FileText, ArrowRight } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import { legalConfig } from '../data/legalContent';

const sections = [
  {
    title: '1. Information we collect',
    text: 'We may collect account information such as your name, email address, mobile number, date of birth, gender, relationship preferences, profile text, uploaded media, profile photos, and any information you share in conversations, messages, or video calls. We also collect technical information such as device type, browser, IP address, app version, login timestamps, location-derived data where needed, and security-related logs when those features are used.'
  },
  {
    title: '2. Why we process personal data',
    text: 'We use personal data to provide account access, profile matching, communication features, moderation, user safety, payments, subscriptions, support, analytics, fraud prevention, service continuity, and legal compliance. Processing may also be necessary to protect the rights and safety of users and the platform.'
  },
  {
    title: '3. Data from messages, calls, and uploads',
    text: 'Messages, profile media, call metadata, payment references, subscriptions, and user-generated content may be stored to facilitate the platform experience, moderation, abuse reporting, and service operations. The platform does not promise complete anonymity or end-to-end encryption of all communications, and some metadata may be retained for account, safety, and support purposes.'
  },
  {
    title: '4. Cookies and analytics',
    text: 'We may use cookies, local storage, analytics tools, and platform-integrated tracking technologies to understand traffic patterns, improve user experience, monitor performance, support ad and measurement operations, and maintain the integrity of the service. If a third-party analytics or hosting provider is used, that provider may process limited technical and usage data under its own privacy terms.'
  },
  {
    title: '5. Information sharing',
    text: 'We may share personal information with hosting providers, communication tools, payment processors, analytics services, moderation systems, and support vendors strictly to operate the service. We do not sell personal data. Where required by law, we may also share information with regulators, law-enforcement authorities, or designated grievance contacts for safety, fraud prevention, or legal compliance.'
  },
  {
    title: '6. Data retention and deletion',
    text: 'We retain personal data only for as long as needed to operate the service, meet legal obligations, resolve disputes, or enforce our policies. If you delete your account, we may retain certain records where required for legal compliance, billing reconciliation, moderation, fraud review, or safety investigations.'
  },
  {
    title: '7. Security measures',
    text: 'We use reasonable administrative, technical, and organisational safeguards to protect personal information, including access controls, secure hosting, limiting access to authorized personnel, and monitoring for suspicious activity. No system is completely immune to risk, and the company cannot guarantee absolute security against all potential threats.'
  },
  {
    title: '8. Children and adults',
    text: 'Elovia Love is intended for users aged 18 and above. We do not knowingly collect or maintain information from children under the age of 18. If we become aware of such data, we will take steps to remove it in line with applicable law.'
  },
  {
    title: '9. Your rights and privacy requests',
    text: 'Depending on applicable law, you may have rights to access your personal data, request correction, ask for deletion, restrict processing, object to certain uses, or request a copy of your information where that is legally available. To submit a privacy request, account deletion request, or grievance, contact us using the support email or the contact form.'
  }
];

const highlights = [
  { icon: UserCog, title: 'Profile and account data', text: 'We use your profile details to create and manage an accurate member account.' },
  { icon: ShieldCheck, title: 'Safety and moderation', text: 'We review reports, restrict abusive users, and help maintain a safer community.' },
  { icon: LockKeyhole, title: 'Security and limits', text: 'We protect sensitive user data with access controls and secure infrastructure.' },
  { icon: FileText, title: 'Privacy requests', text: 'We respond to user privacy requests and account deletion inquiries through support channels.' }
];

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Elovia Love</title>
        <meta name="description" content="Review Elovia Love's privacy policy for collecting, using, storing, and protecting user data on the platform." />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 px-4 py-24 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 rounded-[2rem] border border-rose-100 bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Privacy policy</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              We respect your privacy and aim to be transparent about how {legalConfig.businessName} processes personal data in connection with accounts, safety, communication, payments, and service operations.
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
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Contact us about privacy</h2>
            <p className="mb-5 text-slate-700">
              If you want to exercise a privacy right, request deletion of your account, ask a question about your data, or raise a grievance, contact {legalConfig.businessName} through the support email or the contact form. We may need to verify your identity before processing sensitive legal requests.
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
