import React, { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { VideoCallProvider, useVideoCall } from './context/VideoCallContext';
import CookieConsent from './components/CookieConsent';
import AdInitializer from './components/ads/AdInitializer';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const Discover = lazy(() => import('./pages/Discover'));
const CityPage = lazy(() => import('./pages/CityPage'));
const DatingInIndiaPage = lazy(() => import('./pages/DatingInIndiaPage'));
const DatingInDelhiPage = lazy(() => import('./pages/DatingInDelhiPage'));
const DatingInMumbaiPage = lazy(() => import('./pages/DatingInMumbaiPage'));
const DatingInBangalorePage = lazy(() => import('./pages/DatingInBangalorePage'));
const DatingInKolkataPage = lazy(() => import('./pages/DatingInKolkataPage'));
const DatingInRanchiPage = lazy(() => import('./pages/DatingInRanchiPage'));
const Hyderabad = lazy(() => import('./pages/cities/Hyderabad'));
const Chennai = lazy(() => import('./pages/cities/Chennai'));
const London = lazy(() => import('./pages/cities/London'));
const NewYork = lazy(() => import('./pages/cities/NewYork'));
const Toronto = lazy(() => import('./pages/cities/Toronto'));
const Sydney = lazy(() => import('./pages/cities/Sydney'));
const Dubai = lazy(() => import('./pages/cities/Dubai'));
const Singapore = lazy(() => import('./pages/cities/Singapore'));
const UnitedStates = lazy(() => import('./pages/countries/UnitedStates'));
const Canada = lazy(() => import('./pages/countries/Canada'));
const UnitedKingdom = lazy(() => import('./pages/countries/UnitedKingdom'));
const Australia = lazy(() => import('./pages/countries/Australia'));
const UnitedArabEmirates = lazy(() => import('./pages/countries/UnitedArabEmirates'));
const SingaporeCountry = lazy(() => import('./pages/countries/Singapore'));
const Germany = lazy(() => import('./pages/countries/Germany'));
const France = lazy(() => import('./pages/countries/France'));
const Japan = lazy(() => import('./pages/countries/Japan'));
const Brazil = lazy(() => import('./pages/countries/Brazil'));
const Mexico = lazy(() => import('./pages/countries/Mexico'));
const Nepal = lazy(() => import('./pages/countries/Nepal'));
const Bangladesh = lazy(() => import('./pages/countries/Bangladesh'));
const Malaysia = lazy(() => import('./pages/countries/Malaysia'));
const SouthAfrica = lazy(() => import('./pages/countries/SouthAfrica'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Chats = lazy(() => import('./pages/Chats'));
const Chat = lazy(() => import('./pages/Chat'));
const Matches = lazy(() => import('./pages/Matches'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const Settings = lazy(() => import('./pages/Settings'));
const SalesmanSection = lazy(() => import('./pages/salesman/SalesmanSection'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const SafetyHub = lazy(() => import('./pages/SafetyHub'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ReportAbuse = lazy(() => import('./pages/ReportAbuse'));
const VerificationGuide = lazy(() => import('./pages/VerificationGuide'));
const Pricing = lazy(() => import('./pages/Pricing'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const RandomVideoPage = lazy(() => import('./pages/RandomVideo'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMatches = lazy(() => import('./pages/admin/AdminMatches'));
const AdminChats = lazy(() => import('./pages/admin/AdminChats'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminVisitors = lazy(() => import('./pages/admin/AdminVisitors'));
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const RandomVideoMonitor = lazy(() => import('./pages/admin/RandomVideoMonitor'));
const IncomingCallModal = lazy(() => import('./components/videocall/IncomingCallModal'));
const OutgoingCallScreen = lazy(() => import('./components/videocall/OutgoingCallScreen'));
const VideoCallScreen = lazy(() => import('./components/videocall/VideoCallScreen'));

const VISITOR_ID_KEY = 'elovia_visitor_id';

const getVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = (window.crypto?.randomUUID?.() || `visitor_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`);
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
};

const trackPageVisit = async (page) => {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  try {
    await api.post('/analytics/track', { visitorId, page });
  } catch (err) {
    console.debug('Visitor analytics tracking failed:', err?.message || err);
  }
};

// Global Video Call Handler Component
function VideoCallHandler() {
  const {
    incomingCall,
    activeCall,
    callStatus,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    connectionQuality,
    isReconnecting,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleVideo,
    toggleAudio,
  } = useVideoCall();

  // Incoming call modal (receiver side)
  if (incomingCall && !activeCall) {
    return (
      <IncomingCallModal
        caller={incomingCall.callerInfo}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }

  // Outgoing call screen (caller side - waiting for answer)
  if (activeCall && (callStatus === 'calling' || callStatus === 'ringing') && !remoteStream) {
    return (
      <OutgoingCallScreen
        receiver={activeCall.receiverInfo || {}}
        onCancel={() => cancelCall(activeCall._id)}
      />
    );
  }

  // Active call screen (both sides - call connected)
  if (activeCall && callStatus === 'connected' && remoteStream) {
    return (
      <VideoCallScreen
        localStream={localStream}
        remoteStream={remoteStream}
        callStatus={callStatus}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        connectionQuality={connectionQuality}
        isReconnecting={isReconnecting}
        otherUser={activeCall.receiverId === incomingCall?.callerInfo?._id 
          ? incomingCall.callerInfo 
          : activeCall.receiverInfo}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onEndCall={() => endCall('good')}
        callStartTime={activeCall.startedAt}
      />
    );
  }

  return null;
}

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/register';
  const isDiscoverPage = location.pathname === '/discover' || location.pathname.startsWith('/discover/');
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const hideGlobalNavbar = isAdminPage || isAuthPage;
  const hideFooter = isAdminPage || isAuthPage || isDiscoverPage || isDashboardPage;
  const hideChatInterface = location.pathname === '/chats' || location.pathname.startsWith('/chat/');
  const [chatNavbarHeight, setChatNavbarHeight] = useState(80);
  const [chatViewportHeight, setChatViewportHeight] = useState(() => (
    typeof window === 'undefined' ? 0 : window.visualViewport?.height || window.innerHeight
  ));

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (!isChatPage) return undefined;

    const navbar = document.querySelector('[data-site-navbar]');
    const visualViewport = window.visualViewport;
    const updateViewport = () => {
      setChatViewportHeight(visualViewport?.height || window.innerHeight);
    };
    const updateNavbarHeight = () => {
      if (navbar) setChatNavbarHeight(navbar.getBoundingClientRect().bottom);
    };
    const resizeObserver = navbar ? new ResizeObserver(updateNavbarHeight) : null;
    const handleNavbarTransitionEnd = (event) => {
      if (event.target === navbar) updateNavbarHeight();
    };

    updateViewport();
    updateNavbarHeight();
    if (navbar) {
      resizeObserver.observe(navbar, { box: 'border-box' });
      navbar.addEventListener('transitionend', handleNavbarTransitionEnd);
    }
    window.addEventListener('resize', updateViewport);
    visualViewport?.addEventListener('resize', updateViewport);

    return () => {
      resizeObserver?.disconnect();
      navbar?.removeEventListener('transitionend', handleNavbarTransitionEnd);
      window.removeEventListener('resize', updateViewport);
      visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, [isChatPage]);

  return (
    <>
      <AdInitializer />
      {!hideGlobalNavbar && <GlobalNavbar />}
      
      {/* Global Video Call Handler */}
      <Suspense fallback={null}>
        <VideoCallHandler />
      </Suspense>

      <main
        className={isChatPage
          ? 'box-border min-h-0 overflow-hidden'
          : isAdminPage
            ? 'h-screen h-dvh overflow-hidden'
            : `min-h-screen ${!hideGlobalNavbar ? 'pt-20' : ''}`}
        style={isChatPage ? {
          height: `${chatViewportHeight}px`,
          paddingTop: `${chatNavbarHeight}px`,
        } : undefined}
      >
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" role="status">Loading page...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/dating-in-india" element={<DatingInIndiaPage />} />
          <Route path="/dating-in-delhi" element={<DatingInDelhiPage />} />
          <Route path="/dating-in-mumbai" element={<DatingInMumbaiPage />} />
          <Route path="/dating-in-bangalore" element={<DatingInBangalorePage />} />
          <Route path="/dating-in-kolkata" element={<DatingInKolkataPage />} />
          <Route path="/dating-in-ranchi" element={<DatingInRanchiPage />} />
          <Route path="/dating/hyderabad" element={<Hyderabad />} />
          <Route path="/dating/chennai" element={<Chennai />} />
          <Route path="/dating/london" element={<London />} />
          <Route path="/dating/new-york" element={<NewYork />} />
          <Route path="/dating/toronto" element={<Toronto />} />
          <Route path="/dating/sydney" element={<Sydney />} />
          <Route path="/dating/dubai" element={<Dubai />} />
          <Route path="/dating/singapore" element={<Singapore />} />
          <Route path="/dating/united-states" element={<UnitedStates />} />
          <Route path="/dating/canada" element={<Canada />} />
          <Route path="/dating/united-kingdom" element={<UnitedKingdom />} />
          <Route path="/dating/australia" element={<Australia />} />
          <Route path="/dating/united-arab-emirates" element={<UnitedArabEmirates />} />
          <Route path="/dating/singapore" element={<SingaporeCountry />} />
          <Route path="/dating/germany" element={<Germany />} />
          <Route path="/dating/france" element={<France />} />
          <Route path="/dating/japan" element={<Japan />} />
          <Route path="/dating/brazil" element={<Brazil />} />
          <Route path="/dating/mexico" element={<Mexico />} />
          <Route path="/dating/nepal" element={<Nepal />} />
          <Route path="/dating/bangladesh" element={<Bangladesh />} />
          <Route path="/dating/malaysia" element={<Malaysia />} />
          <Route path="/dating/south-africa" element={<SouthAfrica />} />
          <Route path="/dating-in-:city" element={<CityPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/safety" element={<SafetyHub />} />
          <Route path="/report-abuse" element={<ReportAbuse />} />
          <Route path="/how-verification-works" element={<VerificationGuide />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscription/success" element={<SubscriptionSuccess />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/home"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route path="/chat" element={<Navigate to="/chats" replace />} />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/random-video"
            element={
              <ProtectedRoute>
                <RandomVideoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman"
            element={
              <ProtectedRoute>
                <SalesmanSection section="home" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/home"
            element={
              <ProtectedRoute>
                <SalesmanSection section="home" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/leads"
            element={
              <ProtectedRoute>
                <SalesmanSection section="leads" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/follow-ups"
            element={
              <ProtectedRoute>
                <SalesmanSection section="follow-ups" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/admissions"
            element={
              <ProtectedRoute>
                <SalesmanSection section="admissions" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/students"
            element={
              <ProtectedRoute>
                <SalesmanSection section="students" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/reports"
            element={
              <ProtectedRoute>
                <SalesmanSection section="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/notifications"
            element={
              <ProtectedRoute>
                <SalesmanSection section="notifications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/chat"
            element={
              <ProtectedRoute>
                <SalesmanSection section="chat" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/profile"
            element={
              <ProtectedRoute>
                <SalesmanSection section="profile" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/settings"
            element={
              <ProtectedRoute>
                <SalesmanSection section="settings" />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/matches" element={<AdminRoute><AdminMatches /></AdminRoute>} />
          <Route path="/admin/chats" element={<AdminRoute><AdminChats /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/random-video/monitor" element={<AdminRoute><RandomVideoMonitor /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/visitors" element={<AdminRoute><AdminVisitors /></AdminRoute>} />
          <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />

          {/* 404 MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>

      {!hideChatInterface && !hideFooter && <Footer />}
      <CookieConsent />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <VideoCallProvider>
          <Router>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </Router>
        </VideoCallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
