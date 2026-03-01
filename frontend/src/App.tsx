import React, { useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginSelection from './components/LoginSelection';
import AdminLogin from './components/AdminLogin';
import CustomerLogin from './components/CustomerLogin';
import Layout from './components/Layout';
import Home from './components/Home';
import ServiceCatalog from './components/ServiceCatalog';
import ServiceForm from './components/ServiceForm';
import MyOrders from './components/MyOrders';
import OrderTracking from './components/OrderTracking';
import Receipt from './components/Receipt';
import AdminDashboard from './components/AdminDashboard';
import AdminQRManagement from './components/AdminQRManagement';
import PaymentScreen from './components/PaymentScreen';
import Contact from './components/Contact';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Screen =
  | { type: 'splash' }
  | { type: 'login-selection' }
  | { type: 'admin-login' }
  | { type: 'customer-login' }
  | { type: 'main'; tab: string }
  | { type: 'service-form'; serviceName: string }
  | { type: 'order-tracking'; orderId: string }
  | { type: 'receipt'; orderId: string }
  | { type: 'payment'; orderId: string; serviceName: string }
  | { type: 'admin-qr' };

function AppContent() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [screen, setScreen] = useState<Screen>({ type: 'splash' });

  const handleSplashComplete = useCallback(() => {
    if (isAuthenticated) {
      setScreen({ type: 'main', tab: isAdmin ? 'dashboard' : 'home' });
    } else {
      setScreen({ type: 'login-selection' });
    }
  }, [isAuthenticated, isAdmin]);

  const handleAdminLoginSuccess = useCallback(() => {
    setScreen({ type: 'main', tab: 'dashboard' });
  }, []);

  const handleCustomerLoginSuccess = useCallback(() => {
    setScreen({ type: 'main', tab: 'home' });
  }, []);

  const handleNavigate = useCallback((tab: string) => {
    setScreen({ type: 'main', tab });
  }, []);

  const handleSelectService = useCallback((serviceName: string) => {
    setScreen({ type: 'service-form', serviceName });
  }, []);

  const handleFormSuccess = useCallback((orderId: string) => {
    setScreen({ type: 'order-tracking', orderId });
  }, []);

  const handleViewOrder = useCallback((orderId: string) => {
    setScreen({ type: 'order-tracking', orderId });
  }, []);

  const handleViewReceipt = useCallback((orderId: string) => {
    setScreen({ type: 'receipt', orderId });
  }, []);

  const handleNavigateQR = useCallback(() => {
    setScreen({ type: 'admin-qr' });
  }, []);

  // Splash screen
  if (screen.type === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Login selection
  if (screen.type === 'login-selection') {
    return (
      <LoginSelection
        onAdminLogin={() => setScreen({ type: 'admin-login' })}
        onCustomerLogin={() => setScreen({ type: 'customer-login' })}
      />
    );
  }

  // Admin login
  if (screen.type === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onBack={() => setScreen({ type: 'login-selection' })}
      />
    );
  }

  // Customer login
  if (screen.type === 'customer-login') {
    return (
      <CustomerLogin
        onSuccess={handleCustomerLoginSuccess}
        onBack={() => setScreen({ type: 'login-selection' })}
      />
    );
  }

  // Service form (outside layout for full screen)
  if (screen.type === 'service-form') {
    return (
      <div className="h-screen overflow-y-auto" style={{ background: 'oklch(0.14 0.04 240)' }}>
        <ServiceForm
          serviceName={screen.serviceName}
          onBack={() => setScreen({ type: 'main', tab: 'services' })}
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  // Order tracking (outside layout for full screen)
  if (screen.type === 'order-tracking') {
    return (
      <div className="h-screen overflow-y-auto" style={{ background: 'oklch(0.14 0.04 240)' }}>
        <OrderTracking
          orderId={screen.orderId}
          onBack={() => setScreen({ type: 'main', tab: isAdmin ? 'dashboard' : 'orders' })}
          onViewReceipt={handleViewReceipt}
        />
      </div>
    );
  }

  // Receipt
  if (screen.type === 'receipt') {
    return (
      <div className="h-screen overflow-y-auto" style={{ background: 'oklch(0.14 0.04 240)' }}>
        <Receipt
          orderId={screen.orderId}
          onBack={() => setScreen({ type: 'main', tab: isAdmin ? 'dashboard' : 'orders' })}
        />
      </div>
    );
  }

  // Payment screen
  if (screen.type === 'payment') {
    return (
      <div className="h-screen overflow-y-auto" style={{ background: 'oklch(0.14 0.04 240)' }}>
        <PaymentScreen
          orderId={screen.orderId}
          serviceName={screen.serviceName}
          onBack={() => setScreen({ type: 'main', tab: isAdmin ? 'dashboard' : 'orders' })}
        />
      </div>
    );
  }

  // Admin QR Management
  if (screen.type === 'admin-qr') {
    return (
      <div className="h-screen overflow-y-auto" style={{ background: 'oklch(0.14 0.04 240)' }}>
        <AdminQRManagement
          onBack={() => setScreen({ type: 'main', tab: 'dashboard' })}
        />
      </div>
    );
  }

  // Main app with layout
  if (screen.type === 'main') {
    const activeTab = screen.tab;

    const renderContent = () => {
      switch (activeTab) {
        case 'home':
          return <Home onNavigate={handleNavigate} />;

        case 'services':
          return <ServiceCatalog onSelectService={handleSelectService} />;

        case 'orders':
          return (
            <MyOrders
              onViewOrder={handleViewOrder}
              onViewReceipt={handleViewReceipt}
            />
          );

        case 'contact':
          return <Contact />;

        case 'dashboard':
          return isAdmin ? (
            <AdminDashboard onNavigateQR={handleNavigateQR} />
          ) : (
            <Home onNavigate={handleNavigate} />
          );

        default:
          return <Home onNavigate={handleNavigate} />;
      }
    };

    return (
      <Layout activeTab={activeTab} onNavigate={handleNavigate}>
        {renderContent()}
      </Layout>
    );
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
