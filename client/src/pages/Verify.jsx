import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, ShieldCheck, CheckCircle2, ArrowLeft, Loader2, BadgeCheck, AlertCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ── Step indicator ────────────────────────────────────────────────────────────
const Step = ({ icon: Icon, label, done, active }) => (
  <div className={`flex flex-col items-center gap-1 ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
      done ? 'bg-green-500 border-green-500' : active ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white'
    }`}>
      {done ? <CheckCircle2 size={18} className="text-white" /> : <Icon size={18} className={active ? 'text-primary-600' : 'text-slate-400'} />}
    </div>
    <span className={`text-[10px] font-semibold ${done ? 'text-green-600' : active ? 'text-primary-600' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const Verify = () => {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('phone'); // phone | email | bluetick
  const fileRef = useRef(null);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState(null); // { type, text }
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Email state
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  // Blue tick state
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [btLoading, setBtLoading] = useState(false);
  const [btMsg, setBtMsg] = useState(null);

  useEffect(() => {
    api.get('/verify/status').then(r => {
      setStatus(r.data);
      setPhone(r.data.phone || '');
    }).catch(() => {});
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Phone OTP ────────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setOtpLoading(true); setOtpMsg(null);
    try {
      const res = await api.post('/verify/send-otp', { phone });
      setOtpSent(true);
      setCountdown(60);
      setOtpMsg({ type: 'success', text: res.data.message });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
    } catch (e) {
      setOtpMsg({ type: 'error', text: e.response?.data?.message || 'Failed to send OTP' });
    } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    setOtpLoading(true); setOtpMsg(null);
    try {
      await api.post('/verify/verify-otp', { otp });
      setOtpMsg({ type: 'success', text: 'Phone verified successfully ✓' });
      setStatus(s => ({ ...s, phoneVerified: true }));
      await loadUser?.();
    } catch (e) {
      setOtpMsg({ type: 'error', text: e.response?.data?.message || 'Verification failed' });
    } finally { setOtpLoading(false); }
  };

  // ── Email ────────────────────────────────────────────────────────────────────
  const sendEmailVerify = async () => {
    setEmailLoading(true); setEmailMsg(null);
    try {
      const res = await api.post('/verify/send-email');
      setEmailMsg({ type: 'success', text: res.data.message });
      if (res.data.devUrl) console.log('Dev verify URL:', res.data.devUrl);
    } catch (e) {
      setEmailMsg({ type: 'error', text: e.response?.data?.message || 'Failed to send email' });
    } finally { setEmailLoading(false); }
  };

  // ── Blue tick ────────────────────────────────────────────────────────────────
  const handleSelfie = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setSelfie(ev.target.result); setSelfiePreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const submitBlueTick = async () => {
    if (!selfie) return setBtMsg({ type: 'error', text: 'Please upload a selfie photo' });
    setBtLoading(true); setBtMsg(null);
    try {
      const res = await api.post('/verify/request-blue-tick', { selfieImage: selfie });
      setBtMsg({ type: 'success', text: res.data.message });
      setStatus(s => ({ ...s, blueTickStatus: 'pending' }));
      await loadUser?.();
    } catch (e) {
      setBtMsg({ type: 'error', text: e.response?.data?.message || 'Submission failed' });
    } finally { setBtLoading(false); }
  };

  const isPremium = ['premium', 'pro'].includes(user?.plan);

  return (
    <>
      <Helmet>
        <title>Verify Your Account — Elovia Love</title>
        <meta name="description" content="Complete account verification to increase trust and match success on Elovia Love." />
        <link rel="canonical" href="https://elovialove.onrender.com/verify" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 pb-16">
        <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm font-medium">
          <ArrowLeft size={18} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Verify Your Account</h1>
          <p className="text-slate-500 text-sm">Build trust and get more matches with a verified profile</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Step icon={Phone} label="Phone" done={status?.phoneVerified} active={activeTab === 'phone'} />
          <div className="flex-1 h-px bg-slate-200 max-w-[40px]" />
          <Step icon={Mail} label="Email" done={status?.emailVerified} active={activeTab === 'email'} />
          <div className="flex-1 h-px bg-slate-200 max-w-[40px]" />
          <Step icon={BadgeCheck} label="Blue Tick" done={status?.isVerified} active={activeTab === 'bluetick'} />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-6">
          {[
            { key: 'phone',    label: '📱 Phone',     done: status?.phoneVerified },
            { key: 'email',    label: '📧 Email',     done: status?.emailVerified },
            { key: 'bluetick', label: '✓ Blue Tick', done: status?.isVerified },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key ? 'bg-gradient-to-r from-primary-600 to-pink-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label} {t.done && '✓'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
          >

            {/* ── Phone Tab ── */}
            {activeTab === 'phone' && (
              status?.phoneVerified ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 text-lg">Phone Verified ✓</p>
                  <p className="text-slate-500 text-sm mt-1">{status.phone}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={otpSent}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-slate-50"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={sendOtp}
                      disabled={otpLoading || !phone}
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {otpLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                      Send OTP
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Enter OTP</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6-digit OTP"
                          maxLength={6}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-center tracking-[0.5em] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                        {devOtp && (
                          <p className="text-xs text-amber-600 mt-1 text-center bg-amber-50 rounded-lg py-1">
                            Dev mode OTP: <strong>{devOtp}</strong>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={verifyOtp}
                        disabled={otpLoading || otp.length < 6}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {otpLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Verify OTP
                      </button>
                      <button
                        onClick={() => { setOtpSent(false); setOtp(''); setOtpMsg(null); setDevOtp(''); }}
                        className="w-full text-sm text-slate-400 hover:text-slate-600 py-1"
                      >
                        Change number
                      </button>
                      {countdown > 0 ? (
                        <p className="text-xs text-center text-slate-400">Resend in {countdown}s</p>
                      ) : (
                        <button onClick={sendOtp} className="w-full text-sm text-primary-600 hover:underline">Resend OTP</button>
                      )}
                    </>
                  )}

                  {otpMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      otpMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {otpMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      {otpMsg.text}
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Email Tab ── */}
            {activeTab === 'email' && (
              status?.emailVerified ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 text-lg">Email Verified ✓</p>
                  <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <Mail size={36} className="text-primary-400 mx-auto mb-2" />
                    <p className="text-slate-700 font-semibold">{user?.email}</p>
                    <p className="text-slate-400 text-sm mt-1">We'll send a verification link to this email</p>
                  </div>
                  <button
                    onClick={sendEmailVerify}
                    disabled={emailLoading}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    Send Verification Email
                  </button>
                  {emailMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      emailMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {emailMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      {emailMsg.text}
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Blue Tick Tab ── */}
            {activeTab === 'bluetick' && (
              status?.isVerified ? (
                <div className="text-center py-6">
                  <BadgeCheck size={52} className="text-blue-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 text-lg">Blue Tick Verified ✓</p>
                  <p className="text-slate-500 text-sm mt-1">Your profile shows a verified badge to other users</p>
                </div>
              ) : status?.blueTickStatus === 'pending' ? (
                <div className="text-center py-6">
                  <Loader2 size={44} className="text-amber-500 mx-auto mb-3 animate-spin" />
                  <p className="font-bold text-slate-900 text-lg">Under Review</p>
                  <p className="text-slate-500 text-sm mt-1">Admin will review your request within 24–48 hours</p>
                </div>
              ) : status?.blueTickStatus === 'rejected' ? (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-900">Request Rejected</p>
                    <p className="text-slate-500 text-sm mt-1">You can resubmit with a clearer selfie</p>
                  </div>
                  {!isPremium && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                      <p className="text-amber-700 text-sm font-medium">Blue tick requires Premium or Pro plan</p>
                      <a href="/pricing" className="text-primary-600 text-sm font-bold hover:underline mt-1 block">Upgrade Now →</a>
                    </div>
                  )}
                  {isPremium && renderBlueTickForm()}
                </div>
              ) : !isPremium ? (
                <div className="text-center py-6">
                  <BadgeCheck size={44} className="text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 text-lg">Blue Tick Verification</p>
                  <p className="text-slate-500 text-sm mt-1 mb-4">Available for Premium and Pro members only</p>
                  <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl text-sm shadow-lg">
                    Upgrade to Apply
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm text-center">Upload a clear selfie to verify your identity. Admin will review within 24–48 hours.</p>

                  {/* Selfie upload */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary-200" />
                    ) : (
                      <>
                        <Camera size={32} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Tap to upload selfie</p>
                        <p className="text-slate-400 text-xs mt-1">Clear face photo required</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSelfie} />
                  </div>

                  <button
                    onClick={submitBlueTick}
                    disabled={btLoading || !selfie}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-primary-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {btLoading ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                    Submit for Verification
                  </button>

                  {btMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      btMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {btMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      {btMsg.text}
                    </div>
                  )}
                </div>
              )
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default Verify;
