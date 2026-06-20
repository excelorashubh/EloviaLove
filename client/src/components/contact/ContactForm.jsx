import { useEffect, useMemo, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitContactMessage } from '../../services/contact';
import PhoneInput from './PhoneInput';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+\d{7,20}$/;

const normalizePhoneForValidation = (phone) => phone.replace(/\s+/g, '');

const initialState = {
  fullName: '',
  email: '',
  countryCode: '+91',
  phoneNumber: '',
  subject: '',
  message: '',
  honeypot: ''
};

export default function ContactForm() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        fullName: user.name || current.fullName,
        email: user.email || current.email,
        countryCode: user.phone?.startsWith('+') ? user.phone.split(' ')[0] : current.countryCode,
        phoneNumber: user.phone ? user.phone.replace(/^\+\d+\s*/, '') : current.phoneNumber,
      }));
    }
  }, [user]);

  const combinedPhone = useMemo(() => {
    if (!form.phoneNumber) return '';
    return `${form.countryCode} ${form.phoneNumber.trim()}`.trim();
  }, [form.countryCode, form.phoneNumber]);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!form.email.trim()) nextErrors.email = 'Please enter your email address.';
    else if (!emailRegex.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (form.phoneNumber.trim() && !phoneRegex.test(normalizePhoneForValidation(combinedPhone))) nextErrors.phoneNumber = 'Please enter a valid phone number with country code.';
    if (!form.subject.trim()) nextErrors.subject = 'Please enter a subject.';
    else if (form.subject.trim().length < 5) nextErrors.subject = 'Subject must be at least 5 characters.';
    else if (form.subject.trim().length > 120) nextErrors.subject = 'Subject cannot exceed 120 characters.';
    if (!form.message.trim()) nextErrors.message = 'Please enter your message.';
    else if (form.message.trim().length < 15) nextErrors.message = 'Message must be at least 15 characters.';
    else if (form.message.trim().length > 2000) nextErrors.message = 'Message cannot exceed 2000 characters.';
    if (form.honeypot.trim()) nextErrors.honeypot = 'Spam detected.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePhoneChange = ({ countryCode, phoneNumber }) => {
    setForm((prev) => ({ ...prev, countryCode, phoneNumber }));
    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...initialState,
      fullName: user?.name || '',
      email: user?.email || '',
      countryCode: user?.phone?.startsWith('+') ? user.phone.split(' ')[0] : '+91',
      phoneNumber: user?.phone ? user.phone.replace(/^\+\d+\s*/, '') : ''
    }));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus({ loading: true, success: '', error: '' });

    try {
      await submitContactMessage({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: combinedPhone,
        subject: form.subject.trim(),
        message: form.message.trim(),
        honeypot: form.honeypot.trim()
      });
      setStatus({ loading: false, success: 'Your message was sent successfully! We will get back to you soon.', error: '' });
      resetForm();
      setTimeout(() => setStatus((prev) => ({ ...prev, success: '' })), 6000);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send your message. Please try again later.';
      setStatus({ loading: false, success: '', error: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status.success && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {status.success}
        </div>
      )}
      {status.error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {status.error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name *</label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange('fullName')}
            placeholder="John Doe"
            className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="john@example.com"
            className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <PhoneInput
        countryCode={form.countryCode}
        phoneNumber={form.phoneNumber}
        onChange={handlePhoneChange}
        error={errors.phoneNumber}
      />

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject *</label>
        <input
          id="subject"
          type="text"
          value={form.subject}
          onChange={handleChange('subject')}
          placeholder="How can we help you today?"
          className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.subject ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
        />
        {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700">Message *</label>
        <textarea
          id="message"
          rows="6"
          value={form.message}
          onChange={handleChange('message')}
          placeholder="Tell us what you need help with..."
          className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition resize-none ${errors.message ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
        />
        {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
      </div>

      <input type="text" name="honeypot" value={form.honeypot} onChange={handleChange('honeypot')} className="hidden" autoComplete="off" />

      <button
        type="submit"
        disabled={status.loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-primary-600 to-pink-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {status.loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
