import React, { useState, useCallback, useEffect, useRef } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminQRManagement from "./components/AdminQRManagement";
import Contact from "./components/Contact";
import CustomerLogin from "./components/CustomerLogin";
import Home from "./components/Home";
import Layout from "./components/Layout";
import LoginSelection from "./components/LoginSelection";
import MyOrders from "./components/MyOrders";
import OrderTracking from "./components/OrderTracking";
import PaymentScreen from "./components/PaymentScreen";
import Receipt from "./components/Receipt";
import ServiceCatalog from "./components/ServiceCatalog";
import ServiceForm from "./components/ServiceForm";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useActor } from "./hooks/useActor";

type Screen =
  | { type: "splash" }
  | { type: "login-selection" }
  | { type: "admin-login" }
  | { type: "customer-login" }
  | { type: "main"; tab: string }
  | { type: "service-form"; serviceName: string }
  | { type: "order-tracking"; trackingId: string }
  | { type: "receipt"; orderId: string }
  | { type: "payment"; orderId: string; serviceName: string }
  | { type: "admin-qr" };

function AppContent() {
  const {
    isAdmin,
    isAuthenticated,
    customerSession,
    adminLogout,
    customerLogout,
  } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const [screen, setScreen] = useState<Screen>({ type: "splash" });
  const splashDoneRef = useRef(false);
  const adminReauthDoneRef = useRef(false);

  useEffect(() => {
    if (!isAdmin || actorFetching || !actor || adminReauthDoneRef.current)
      return;
    adminReauthDoneRef.current = true;
    actor.adminLogin("vijay@123", "Vijay@2026").catch(() => {});
  }, [isAdmin, actor, actorFetching]);

  useEffect(() => {
    if (!splashDoneRef.current) return;
    if (!isAuthenticated) {
      adminReauthDoneRef.current = false;
      setScreen({ type: "login-selection" });
    }
  }, [isAuthenticated]);

  const handleSplashComplete = useCallback(() => {
    splashDoneRef.current = true;
    if (isAuthenticated) {
      setScreen({ type: "main", tab: isAdmin ? "dashboard" : "home" });
    } else {
      setScreen({ type: "login-selection" });
    }
  }, [isAuthenticated, isAdmin]);

  const handleAdminLoginSuccess = useCallback(() => {
    setScreen({ type: "main", tab: "dashboard" });
  }, []);

  const handleCustomerLoginSuccess = useCallback(() => {
    setScreen({ type: "main", tab: "home" });
  }, []);

  const handleNavigate = useCallback((tab: string) => {
    setScreen({ type: "main", tab });
  }, []);

  const handleLogout = useCallback(() => {
    adminReauthDoneRef.current = false;
    if (isAdmin) {
      adminLogout();
    } else {
      customerLogout();
    }
    setScreen({ type: "login-selection" });
  }, [isAdmin, adminLogout, customerLogout]);

  const handleSelectService = useCallback((serviceName: string) => {
    setScreen({ type: "service-form", serviceName });
  }, []);

  const handleFormSuccess = useCallback((trackingId: string) => {
    setScreen({ type: "order-tracking", trackingId });
  }, []);

  const handleViewOrder = useCallback((trackingId: string) => {
    setScreen({ type: "order-tracking", trackingId });
  }, []);

  const handleViewReceipt = useCallback((orderId: string) => {
    setScreen({ type: "receipt", orderId });
  }, []);

  const handleNavigateQR = useCallback(() => {
    setScreen({ type: "admin-qr" });
  }, []);

  if (screen.type === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (screen.type === "login-selection") {
    return (
      <LoginSelection
        onAdminLogin={() => setScreen({ type: "admin-login" })}
        onCustomerLogin={() => setScreen({ type: "customer-login" })}
      />
    );
  }

  if (screen.type === "admin-login") {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onBack={() => setScreen({ type: "login-selection" })}
      />
    );
  }

  if (screen.type === "customer-login") {
    return (
      <CustomerLogin
        onSuccess={handleCustomerLoginSuccess}
        onBack={() => setScreen({ type: "login-selection" })}
      />
    );
  }

  if (screen.type === "service-form") {
    return (
      <div
        className="h-screen overflow-y-auto"
        style={{ background: "oklch(0.14 0.04 240)" }}
      >
        <ServiceForm
          serviceName={screen.serviceName}
          customerId={customerSession?.mobile || ""}
          customerName={customerSession?.name || ""}
          onBack={() => setScreen({ type: "main", tab: "services" })}
          onTrackOrder={handleFormSuccess}
        />
      </div>
    );
  }

  if (screen.type === "order-tracking") {
    return (
      <div
        className="h-screen overflow-y-auto"
        style={{ background: "oklch(0.14 0.04 240)" }}
      >
        <OrderTracking
          initialTrackingId={screen.trackingId}
          onBack={() =>
            setScreen({ type: "main", tab: isAdmin ? "dashboard" : "orders" })
          }
          onViewReceipt={handleViewReceipt}
        />
      </div>
    );
  }

  if (screen.type === "receipt") {
    return (
      <div
        className="h-screen overflow-y-auto"
        style={{ background: "oklch(0.14 0.04 240)" }}
      >
        <Receipt
          orderId={screen.orderId}
          onBack={() =>
            setScreen({ type: "main", tab: isAdmin ? "dashboard" : "orders" })
          }
        />
      </div>
    );
  }

  if (screen.type === "payment") {
    return (
      <div
        className="h-screen overflow-y-auto"
        style={{ background: "oklch(0.14 0.04 240)" }}
      >
        <PaymentScreen
          orderId={screen.orderId}
          serviceName={screen.serviceName}
          onBack={() =>
            setScreen({ type: "main", tab: isAdmin ? "dashboard" : "orders" })
          }
        />
      </div>
    );
  }

  if (screen.type === "admin-qr") {
    return (
      <div
        className="h-screen overflow-y-auto"
        style={{ background: "oklch(0.14 0.04 240)" }}
      >
        <AdminQRManagement
          onBack={() => setScreen({ type: "main", tab: "dashboard" })}
        />
      </div>
    );
  }

  if (screen.type === "main") {
    const activeTab = screen.tab;

    const renderContent = () => {
      switch (activeTab) {
        case "home":
          return <Home onNavigate={handleNavigate} />;

        case "services":
          return <ServiceCatalog onSelectService={handleSelectService} />;

        case "orders":
          return (
            <MyOrders
              customerId={customerSession?.mobile || ""}
              onTrackOrder={handleViewOrder}
              onViewReceipt={handleViewReceipt}
              onPayNow={(oid, svcName) =>
                setScreen({
                  type: "payment",
                  orderId: oid,
                  serviceName: svcName,
                })
              }
            />
          );

        case "contact":
          return <Contact />;

        case "dashboard":
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
      <Layout
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
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
