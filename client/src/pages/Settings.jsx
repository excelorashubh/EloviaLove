import React from 'react';
import { Helmet } from 'react-helmet-async';

const Settings = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:px-6 lg:px-8">
      <Helmet>
        <title>Settings | Excelora Classes</title>
        <meta
          name="description"
          content="Manage your Excelora Classes account settings, notifications, and profile preferences."
        />
        <link rel="canonical" href="https://exceloraclasses.com/settings" />
      </Helmet>

      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Account Settings</h1>
        <p className="text-slate-600 mb-8">
          Keep your Excelora Classes account and communication preferences up to date.
        </p>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Access</h2>
            <p className="text-slate-600">
              Update your personal information, email preferences, and password settings in one place.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Privacy Controls</h2>
            <p className="text-slate-600">
              Control who can contact you, manage notifications, and review our privacy policy.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Support</h2>
            <p className="text-slate-600">
              Need help? Visit our contact page or reach out to support for account-specific assistance.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Settings;
