import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Heart, Sparkles, Video, MessageCircle, ShieldCheck, Coins, TimerReset, SkipForward, Ban, Flag, Mic, MicOff, Camera, CameraOff, RefreshCw, Sparkle, Gift, X } from 'lucide-react';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const RandomVideoMatchPanel = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [cards, setCards] = useState({ randomMatchCards: 20, giftClaimed: false, coins: 0 });
  const [partner, setPartner] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Finding your perfect match...');
  const [countdown, setCountdown] = useState(3);
  const [callTimer, setCallTimer] = useState(120);
  const [toast, setToast] = useState(null);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [showCallUi, setShowCallUi] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const socketRef = useRef(null);

  const isFreeMode = useMemo(() => (cards.randomMatchCards > 0), [cards.randomMatchCards]);

  useEffect(() => {
    const pendingGift = window.localStorage.getItem('elovia_random_match_gift_pending');
    if (pendingGift === 'true' && user?.giftClaimed === false) {
      setShowGiftPopup(true);
    }
  }, [user?.giftClaimed]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join', user._id));
    socket.on('matchFound', ({ session: matchSession, partner: matchPartner }) => {
      setPartner(matchPartner);
      setSession(matchSession);
      setStatus('matched');
      setShowCallUi(false);
      setCountdown(3);
      setLoadingMessage('Connecting...');
      setToast({ type: 'success', message: '❤️ Match Found' });
    });
    socket.on('timerUpdate', ({ timer }) => setCallTimer(timer));
    socket.on('endMatch', () => {
      setStatus('idle');
      setPartner(null);
      setSession(null);
      setShowCallUi(false);
      setCallTimer(120);
    });
    socket.on('toast', ({ message }) => setToast({ type: 'info', message }));
    socket.on('partnerDisconnected', () => setToast({ type: 'warning', message: '⚠ Partner Disconnected' }));

    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (status !== 'matched') return;
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setShowCallUi(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await api.get('/random-match/cards');
        if (res.data?.success) setCards(res.data);
      } catch (error) {
        console.error('Failed to load random match cards', error);
      }
    };
    if (user?._id) loadCards();
  }, [user?._id]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const startMatching = async () => {
    if (!user?._id) return;
    setStatus('searching');
    setShowCallUi(false);
    setPartner(null);
    setSession(null);
    setLoadingMessage('Finding your perfect match...');
    try {
      const res = await api.post('/random-match/start');
      if (res.data?.success) {
        if (res.data.status === 'matched') {
          setPartner(res.data.partner);
          setSession(res.data.session);
          setStatus('matched');
          setToast({ type: 'success', message: '❤️ Match Found' });
        } else {
          setStatus('searching');
          setToast({ type: 'info', message: '🔍 Searching nearby' });
        }
      }
    } catch (error) {
      setStatus('idle');
      setToast({ type: 'warning', message: '⚠ Unable to start matching right now' });
    }
  };

  const skipMatch = async () => {
    try {
      await api.post('/random-match/skip');
      setStatus('idle');
      setPartner(null);
      setSession(null);
      setShowCallUi(false);
      setToast({ type: 'info', message: '🔍 Searching Again' });
      window.setTimeout(() => startMatching(), 2000);
    } catch (error) {
      console.error('Skip failed', error);
    }
  };

  const endCall = async () => {
    try {
      await api.post('/random-match/end');
      setStatus('idle');
      setPartner(null);
      setSession(null);
      setShowCallUi(false);
      setCallTimer(120);
    } catch (error) {
      console.error('End failed', error);
    }
  };

  const claimGift = async () => {
    try {
      const res = await api.post('/random-match/recharge', { type: 'gift' });
      if (res.data?.success) {
        setCards(prev => ({ ...prev, randomMatchCards: res.data.randomMatchCards || 20, giftClaimed: true }));
        window.localStorage.removeItem('elovia_random_match_gift_pending');
        setShowGiftPopup(false);
        setToast({ type: 'success', message: '🎉 Gift Claimed Successfully' });
      }
    } catch (error) {
      console.error('Gift claim failed', error);
    }
  };

  const reportUser = async () => {
    if (!partner?._id) return;
    try {
      await api.post('/random-match/report', { targetUserId: partner._id, reason: 'spam' });
      setToast({ type: 'warning', message: '⚠ Report submitted' });
    } catch (error) {
      console.error('Report failed', error);
    }
  };

  const blockUser = async () => {
    if (!partner?._id) return;
    try {
      await api.post('/random-match/block', { targetUserId: partner._id });
      setToast({ type: 'warning', message: '🚫 User blocked' });
    } catch (error) {
      console.error('Block failed', error);
    }
  };

  const avatarSrc = partner?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || user?.name || 'U')}&size=320&background=e879a0&color=fff`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-200/70 bg-linear-to-br from-[#17081f] via-[#3f134f] to-[#8d2c6d] p-5 sm:p-7 text-white shadow-[0_30px_90px_rgba(120,20,90,0.28)]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-pink-400/25 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-100">
              <Sparkles size={14} /> Random Video Match
            </div>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">Meet someone genuine, instantly</h3>
            <p className="mt-2 max-w-2xl text-sm text-fuchsia-100/85 sm:text-base">
              Enjoy secure, meaningful one-to-one video calls with real, verified people and a premium experience designed for honest connection.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gift size={16} className="text-pink-200" /> Welcome cards: <span className="text-lg font-black">{cards.randomMatchCards}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-fuchsia-100/90">
              <Coins size={16} className="text-amber-300" /> Coins: <span className="font-bold">{cards.coins}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
            {status === 'searching' || status === 'matched' ? (
              <div className="relative min-h-80 overflow-hidden rounded-2xl bg-linear-to-br from-black/20 to-fuchsia-900/30 p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 rounded-[22px] border border-white/10"
                  />
                  <div className="relative flex flex-col items-center text-center">
                    {partner ? (
                      <>
                        <img src={avatarSrc} alt={partner?.name} className="h-24 w-24 rounded-full border-4 border-white/30 object-cover shadow-2xl" />
                        <h4 className="mt-4 text-2xl font-bold">{partner?.name}</h4>
                        <p className="mt-1 text-sm text-fuchsia-100/80">{partner?.age || '18+'} • {partner?.location || 'Nearby'}</p>
                        {partner?.isVerified && <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-semibold text-emerald-200"><ShieldCheck size={14} /> Verified</div>}
                      </>
                    ) : (
                      <>
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl shadow-xl">
                          <Heart className="text-pink-300" />
                        </div>
                        <h4 className="mt-4 text-2xl font-bold">{loadingMessage}</h4>
                        <p className="mt-2 text-sm text-fuchsia-100/80">We match you with verified members who fit your preferences.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-pink-500 shadow-lg">
                  <Video size={28} />
                </div>
                <h4 className="mt-4 text-2xl font-bold">Start matching now</h4>
                <p className="mt-2 text-sm text-fuchsia-100/80">Enjoy a premium first-match experience with free cards and free minutes.</p>
              </div>
            )}

            {status === 'matched' && countdown > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-center">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200">Connecting...</div>
                <div className="mt-2 text-5xl font-black text-white">{countdown}</div>
              </div>
            )}

            {showCallUi && session && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="relative min-h-65 overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.16),transparent_62%)]" />
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold backdrop-blur">
                    <TimerReset size={15} className="text-pink-300" /> {callTimer}s
                  </div>
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold backdrop-blur">
                    <Sparkle size={15} className="text-amber-300" /> {isFreeMode ? 'Free cards' : 'Coins'}
                  </div>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm backdrop-blur">
                    <span className="font-semibold">{cards.randomMatchCards} cards</span>
                    <span className="text-fuchsia-200">•</span>
                    <span className="font-semibold">{cards.coins} coins</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-fuchsia-100/90">
                    <MessageCircle size={15} /> Premium one-to-one video call
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20">{isMuted ? <MicOff size={16} /> : <Mic size={16} />}</button>
                    <button onClick={() => setIsCameraOn(!isCameraOn)} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20">{isCameraOn ? <Camera size={16} /> : <CameraOff size={16} />}</button>
                    <button onClick={reportUser} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><Flag size={16} /></button>
                    <button onClick={blockUser} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><Ban size={16} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-100/80">Free match usage</p>
                  <p className="mt-1 text-xl font-bold">{cards.randomMatchCards} cards remaining</p>
                </div>
                <div className="rounded-2xl bg-fuchsia-500/20 p-3 text-fuchsia-100">
                  <Crown size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-fuchsia-100/80">
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2"><span>Each card</span><span>1 video call</span></div>
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2"><span>Max length</span><span>2 minutes</span></div>
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2"><span>Coins after cards</span><span>100 coins / min</span></div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-100/80">Action Center</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={startMatching} disabled={status === 'searching'} className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-fuchsia-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
                  <RefreshCw size={15} /> {status === 'searching' ? 'Searching...' : 'Start Matching'}
                </button>
                <button onClick={skipMatch} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                  <SkipForward size={15} /> Skip
                </button>
                <button onClick={endCall} className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/20">
                  <X size={15} /> End Call
                </button>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-fuchsia-100/80">
                <div className="flex items-center gap-2"><ShieldCheck size={14} /> Safe, verified, and genuine-only matching.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGiftPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
            <motion.div initial={{ y: 24, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-pink-300/30 bg-linear-to-br from-[#2a0f2f] via-[#6f1458] to-[#ff5ca8] p-6 text-center text-white shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%)]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl shadow-lg">🎉</div>
                <h4 className="mt-4 text-3xl font-black">Congratulations!</h4>
                <p className="mt-2 text-lg font-semibold text-pink-100">Welcome to Elovia Love ❤️</p>
                <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-pink-100">Welcome gift</p>
                  <div className="mt-2 text-4xl font-black">20 FREE Random Match Cards</div>
                  <div className="mt-3 flex justify-center gap-3 text-sm text-pink-50/90">
                    <span className="rounded-full bg-white/10 px-3 py-1">❤️ One match</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">⏰ 2 min max</span>
                  </div>
                </div>
                <button onClick={claimGift} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#8d1458] shadow-lg transition hover:scale-[1.02]">
                  <Gift size={16} /> Claim Gift
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur">
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RandomVideoMatchPanel;
