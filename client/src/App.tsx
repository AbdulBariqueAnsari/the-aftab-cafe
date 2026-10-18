import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer Components & Pages
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage, TermsPage, RefundPage } from './pages/PolicyPages';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Components & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminLiveOrders } from './pages/admin/AdminLiveOrders';
import { AdminMenu } from './pages/admin/AdminMenu';
import { AdminTables } from './pages/admin/AdminTables';
import { AdminStudio } from './pages/admin/AdminStudio';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import { AdminStaff } from './pages/admin/AdminStaff';

// Protected Admin Route Guard
const ProtectedAdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-500">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
};

// Customer Layout Wrapper
const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Customer Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund" element={<RefundPage />} />
              </Route>

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedAdminRoute />}>
                <Route index element={<AdminOverview />} />
                <Route path="orders" element={<AdminLiveOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="tables" element={<AdminTables />} />
                <Route path="studio" element={<AdminStudio />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="reviews" element={<AdminPromotions />} />
                <Route path="staff" element={<AdminStaff />} />
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
