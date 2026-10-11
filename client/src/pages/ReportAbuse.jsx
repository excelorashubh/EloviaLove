import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, LoaderCircle, Shield, Flag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Fake profile or impersonation' },
  { value: 'harassment', label: 'Harassment or abusive behavior' },
  { value: 'spam', label: 'Spam or suspicious activity' },
  { value: 'inappropriate_content', label: 'Inappropriate or non-consensual content' },
  { value: 'underage', label: 'Possible underage user' },
  { value: 'other', label: 'Other safety concern or suspected scam' },
];

const USER_ID_PATTERN = /^[a-f\d]{24}$/i;

export default function ReportAbuse() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [reportedUserId, setReportedUserId] = useState(searchParams.get('userId') || '');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSubmitted(false);

    const normalizedUserId = reportedUserId.trim();
    const normalizedDescription = description.trim();
    if (!USER_ID_PATTERN.test(normalizedUserId)) {
      setFormError('Enter the reported user’s 24-character profile ID.');
      return;
    }
    if (!reason) {
      setFormError('Select a report category.');
      return;
    }
    if (normalizedDescription.length < 10 || normalizedDescription.length > 500) {
      setFormError('Describe what happened in 10 to 500 characters.');
      return;
    }
    if (!user) {
      setFormError('Please sign in to submit a report. Reports are securely linked to your account.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/users/report/${encodeURIComponent(normalizedUserId)}`, {
        reason,
        description: normalizedDescription,
      });
      if (!data?.success) {
        throw new Error(data?.message || 'The report could not be submitted.');
      }
      setSubmitted(true);
      setDescription('');
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Unable to submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Report Abuse & Safety Concerns | Elovia Love</title>
        <meta name="description" content="Report a fake profile, harassment, suspicious activity, or another safety concern to Elovia Love." />
      </Helmet>
      <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
            <div className="mb-5 inline-flex rounded-2xl bg-rose-500/20 p-3 text-rose-300">
              <AlertTriangle size={28} />
            </div>
            <h1 className="mb-4 text-3xl font-black sm:text-4xl">Report a Safety Concern</h1>
            <p className="max-w-3xl leading-7 text-slate-300">
              Tell us about a profile or behavior that concerns you. Reports are sent securely to our moderation system for admin review. If you are in immediate danger, contact local emergency services.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                <Flag className="text-rose-600" size={23} /> Submit a report
              </h2>
              {!authLoading && !user && (
                <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Sign in is required to submit a report so moderators can review it and prevent abuse of the reporting system. <Link className="font-semibold underline" to="/login">Sign in</Link>
                </p>
              )}
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="reported-user-id" className="mb-2 block text-sm font-semibold text-slate-700">Reported profile ID <span aria-hidden="true">*</span></label>
                  <input
                    id="reported-user-id"
                    name="reportedUserId"
                    autoComplete="off"
                    required
                    value={reportedUserId}
                    onChange={(event) => setReportedUserId(event.target.value)}
                    placeholder="Paste the profile's 24-character ID"
                    aria-describedby="profile-id-help"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                  <p id="profile-id-help" className="mt-2 text-xs leading-5 text-slate-500">Use the profile ID supplied by the profile or chat link. The server checks that the account exists.</p>
                </div>
                <div>
                  <label htmlFor="report-reason" className="mb-2 block text-sm font-semibold text-slate-700">Report category <span aria-hidden="true">*</span></label>
                  <select
                    id="report-reason"
                    name="reason"
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  >
                    <option value="">Choose a reason</option>
                    {REPORT_REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="report-description" className="mb-2 block text-sm font-semibold text-slate-700">What happened? <span aria-hidden="true">*</span></label>
                  <textarea
                    id="report-description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={5}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the incident. Do not include passwords, OTPs, or unrelated sensitive information."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">{description.length}/500</p>
                </div>
                {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{formError}</p>}
                {submitted && <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-800" role="status"><CheckCircle size={18} /> Report submitted for moderation review.</p>}
                <button
                  type="submit"
                  disabled={submitting || authLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? <><LoaderCircle className="animate-spin" size={18} /> Submitting…</> : 'Submit report'}
                </button>
              </form>
            </section>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Shield className="mb-4 text-rose-600" size={26} />
                <h2 className="mb-3 text-xl font-bold text-slate-900">Your safety matters</h2>
                <p className="text-sm leading-6 text-slate-600">Include clear, relevant details so moderators can assess the concern. Do not send money to other users or share your passwords, OTPs, or banking details.</p>
              </div>
              <nav aria-label="Safety and privacy resources" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Helpful links</h2>
                <ul className="space-y-3 text-sm font-semibold text-rose-700">
                  <li><Link className="hover:underline" to="/safety">Safety Guidelines</Link></li>
                  <li><Link className="hover:underline" to="/privacy">Privacy Policy</Link></li>
                  <li><Link className="hover:underline" to="/contact">Contact Support</Link></li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
