import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './services/api';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Discover from './pages/Discover';
import CityPage from './pages/CityPage';
import DatingInIndiaPage from './pages/DatingInIndiaPage';
import DatingInDelhiPage from './pages/DatingInDelhiPage';
import DatingInMumbaiPage from './pages/DatingInMumbaiPage';
import DatingInBangalorePage from './pages/DatingInBangalorePage';
import DatingInKolkataPage from './pages/DatingInKolkataPage';
import DatingInRanchiPage from './pages/DatingInRanchiPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chats from './pages/Chats';
import Chat from './pages/Chat';
import Matches from './pages/Matches';
import ProfileEdit from './pages/ProfileEdit';
import Settings from './pages/Settings';
import SalesmanSection from './pages/salesman/SalesmanSection';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/SubscriptionSuccess';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminVisitors from './pages/admin/AdminVisitors';
import AdminPlans from './pages/admin/AdminPlans';
import AdminBlog from './pages/admin/AdminBlog';
import AdminAds from './pages/admin/AdminAds';
import AdminContactMessages from './pages/admin/AdminContactMessages';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { VideoCallProvider } from './context/VideoCallContext';
import CookieConsent from './components/CookieConsent';
import AdInitializer from './components/ads/AdInitializer';
import IncomingCallModal from './components/videocall/IncomingCallModal';
import OutgoingCallScreen from './components/videocall/OutgoingCallScreen';
import VideoCallScreen from './components/videocall/VideoCallScreen';
import { useVideoCall } from './context/VideoCallContext';

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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/register';
  const hideGlobalNavbar = location.pathname.startsWith('/admin') || isAuthPage;
  const hideFooter = location.pathname.startsWith('/admin') || isAuthPage;
  const hideChatInterface = location.pathname === '/chat' || location.pathname.startsWith('/chat/');

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <AdInitializer />
      {!hideGlobalNavbar && <GlobalNavbar />}
      
      {/* Global Video Call Handler */}
      <VideoCallHandler />

      <main className={`min-h-screen ${!hideGlobalNavbar ? 'pt-20' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/dating-in-india" element={<DatingInIndiaPage />} />
          <Route path="/dating-in-delhi" element={<DatingInDelhiPage />} />
          <Route path="/dating-in-mumbai" element={<DatingInMumbaiPage />} />
          <Route path="/dating-in-bangalore" element={<DatingInBangalorePage />} />
          <Route path="/dating-in-kolkata" element={<DatingInKolkataPage />} />
          <Route path="/dating-in-ranchi" element={<DatingInRanchiPage />} />
          <Route path="/dating-in-:city" element={<CityPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
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
          <Route path="/admin/messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/visitors" element={<AdminRoute><AdminVisitors /></AdminRoute>} />
          <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />

          {/* 404 MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
            <AppContent />
          </Router>
        </VideoCallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
 
