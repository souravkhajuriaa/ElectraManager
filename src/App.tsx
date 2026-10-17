import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { DataProvider, useData } from '@/src/contexts/DataContext';
import { ChatProvider } from '@/src/contexts/ChatContext';
import { NavigationTab, Product } from '@/src/types';

// Layout
import { Sidebar } from '@/src/components/layout/Sidebar';
import { AdminSidebar } from '@/src/components/layout/AdminSidebar';
import { Navbar } from '@/src/components/layout/Navbar';
import { MobileNav } from '@/src/components/layout/MobileNav';

// AI Chatbot
import { AIChatBot } from '@/src/components/chat/AIChatBot';

// Views
import { AuthView } from '@/src/components/auth/AuthView';
import { AdminLoginModal } from '@/src/components/auth/AdminLoginModal';
import { UserLoginModal } from '@/src/components/auth/UserLoginModal';
import { AdminDashboardView } from '@/src/components/admin/AdminDashboardView';
import { DashboardView } from '@/src/components/dashboard/DashboardView';
import { ItemsView } from '@/src/components/items/ItemsView';
import { ProductsView } from '@/src/components/products/ProductsView';
import { InventoryView } from '@/src/components/inventory/InventoryView';
import { SalesView } from '@/src/components/sales/SalesView';
import { AnalyticsView } from '@/src/components/analytics/AnalyticsView';
import { NotificationsView } from '@/src/components/notifications/NotificationsView';
import { SettingsView } from '@/src/components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    role,
    openAdminLoginModal,
    pendingAdminRedirectTab,
    isUserLoginModalOpen,
    closeUserLoginModal,
  } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salePreselectedProduct, setSalePreselectedProduct] = useState<Product | null>(null);

  const isAdminTab = (tab: NavigationTab) => tab.startsWith('admin-');

  // Prevent accessing admin routes if not in admin role
  useEffect(() => {
    if (isAdminTab(currentTab) && role !== 'admin') {
      setCurrentTab('dashboard');
    }
  }, [role, currentTab]);

  // If not logged in, render the login & OTP verification screen
  if (!isAuthenticated) {
    return <AuthView />;
  }

  const handleNavigate = (tab: NavigationTab) => {
    // Check if user is trying to switch to Admin console without login/authorization
    if (isAdminTab(tab) && role !== 'admin') {
      openAdminLoginModal(tab);
      return;
    }

    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordSaleForProduct = (product: Product) => {
    setSalePreselectedProduct(product);
    setCurrentTab('sales');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebars: User or Admin Mode */}
      {role === 'admin' ? (
        <AdminSidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      ) : (
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto pb-16 lg:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onRecordSaleForProduct={handleRecordSaleForProduct}
            />
          )}

          {currentTab === 'items' && (
            <ItemsView onNavigate={handleNavigate} />
          )}

          {currentTab === 'products' && (
            <ProductsView
              onNavigate={handleNavigate}
              onRecordSaleForProduct={handleRecordSaleForProduct}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              onNavigate={handleNavigate}
              onOpenAddProduct={() => handleNavigate('products')}
            />
          )}

          {currentTab === 'sales' && (
            <SalesView
              onNavigate={handleNavigate}
              preselectedProduct={salePreselectedProduct}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView onNavigate={handleNavigate} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView onNavigate={handleNavigate} />
          )}

          {currentTab === 'settings' && (
            <SettingsView onNavigate={handleNavigate} />
          )}

          {isAdminTab(currentTab) && role === 'admin' && (
            <AdminDashboardView
              currentTab={currentTab}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Admin Login Authentication Modal */}
        <AdminLoginModal
          onSuccess={() => {
            const target = pendingAdminRedirectTab || 'admin-dashboard';
            handleNavigate(target);
          }}
        />

        {/* User Login & Multi-User Selection Modal */}
        <UserLoginModal
          isOpen={isUserLoginModalOpen}
          onClose={closeUserLoginModal}
        />

        {/* AI Chatbot Copilot */}
        <AIChatBot
          onNavigate={handleNavigate}
          onRecordSaleForProduct={handleRecordSaleForProduct}
        />

        {/* Bottom Mobile Tab Bar */}
        <MobileNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onSelectTab={handleNavigate}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ChatProvider>
            <MainAppContent />
          </ChatProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
