import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Notifications from './pages/Notifications';
import Chats from './pages/Chats';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Layout wrapper for public/user pages
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
    {/* <Navbar /> */}
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin — full screen with own sidebar layout */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

          {/* Public & user routes with Navbar + Footer */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/login" element={<MainLayout><GuestRoute><Login /></GuestRoute></MainLayout>} />
          <Route path="/signup" element={<MainLayout><GuestRoute><Signup /></GuestRoute></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><ProtectedRoute><Dashboard /></ProtectedRoute></MainLayout>} />
          <Route path="/discover" element={<MainLayout><ProtectedRoute><Discover /></ProtectedRoute></MainLayout>} />
          <Route path="/matches" element={<MainLayout><ProtectedRoute><Matches /></ProtectedRoute></MainLayout>} />
          <Route path="/chat/:userId" element={<MainLayout><ProtectedRoute><Chat /></ProtectedRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
          <Route path="/profile/edit" element={<MainLayout><ProtectedRoute><ProfileEdit /></ProtectedRoute></MainLayout>} />
          <Route path="/notifications" element={<MainLayout><ProtectedRoute><Notifications /></ProtectedRoute></MainLayout>} />
          <Route path="/chats" element={<MainLayout><ProtectedRoute><Chats /></ProtectedRoute></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
          <Route path="/subscription/success" element={<MainLayout><ProtectedRoute><SubscriptionSuccess /></ProtectedRoute></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
