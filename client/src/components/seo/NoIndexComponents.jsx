import React from 'react';
import { Helmet } from 'react-helmet-async';

// ── NoIndex Implementation for Private Pages ──────────────────────────────────

// 1. NoIndex Wrapper Component
export const NoIndexPage = ({ children, title = "Private Page" }) => (
  <>
    <Helmet>
      <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
      <title>{title} | Elovia Love</title>
    </Helmet>
    {children}
  </>
);

// 2. Admin Pages NoIndex
export const AdminPageWrapper = ({ children, pageTitle }) => (
  <NoIndexPage title={`Admin - ${pageTitle}`}>
    {children}
  </NoIndexPage>
);

// 3. User Profile Pages NoIndex
export const UserProfileWrapper = ({ children, userId }) => (
  <NoIndexPage title={`Profile - ${userId}`}>
    {children}
  </NoIndexPage>
);

// 4. Chat Pages NoIndex
export const ChatWrapper = ({ children, chatId }) => (
  <NoIndexPage title={`Chat - ${chatId}`}>
    {children}
  </NoIndexPage>
);

// 5. Search/Filter Results NoIndex
export const SearchResultsWrapper = ({ children, query }) => (
  <NoIndexPage title={`Search Results - ${query}`}>
    {children}
  </NoIndexPage>
);

// ── Usage in App.jsx ──────────────────────────────────────────────────────────
/*
import { NoIndexPage, AdminPageWrapper, UserProfileWrapper, ChatWrapper } from './components/seo/NoIndexComponents';

// Admin routes
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminPageWrapper pageTitle="Dashboard">
      <AdminDashboard />
    </AdminPageWrapper>
  </AdminRoute>
} />

// User profile routes
<Route path="/profile/:userId" element={
  <ProtectedRoute>
    <UserProfileWrapper userId={userId}>
      <Profile />
    </UserProfileWrapper>
  </ProtectedRoute>
} />

// Chat routes
<Route path="/chat/:userId" element={
  <ProtectedRoute>
    <ChatWrapper chatId={userId}>
      <Chat />
    </ChatWrapper>
  </ProtectedRoute>
} />

// Search/filter routes
<Route path="/discover" element={
  <ProtectedRoute>
    <DiscoverWrapper>
      <Discover />
    </DiscoverWrapper>
  </ProtectedRoute>
} />
*/

export {
  NoIndexPage,
  AdminPageWrapper,
  UserProfileWrapper,
  ChatWrapper,
  SearchResultsWrapper
};