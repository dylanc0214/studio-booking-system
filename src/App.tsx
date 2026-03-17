import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import SignUpPage from './pages/SignUpPage';
import TermsPage from './pages/TermsPage';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import UpcomingBookingsPage from './pages/admin/UpcomingBookingsPage';
import HolidaysPage from './pages/admin/HolidaysPage';

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="pending" element={<PendingApprovalsPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="bookings" element={<UpcomingBookingsPage />} />
            <Route path="holidays" element={<HolidaysPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}
