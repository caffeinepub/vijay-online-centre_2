import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerSession {
  mobile: string;
  name: string;
}

interface AuthContextType {
  // Admin
  isAdmin: boolean;
  adminLogin: (userId: string, password: string) => boolean;
  adminLogout: () => void;

  // Customer
  customerSession: CustomerSession | null;
  setCustomerSession: (session: CustomerSession | null) => void;
  customerLogout: () => void;

  // General
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USER_ID = 'vijay@123user';
const ADMIN_PASSWORD = 'vijay@2026';
const ADMIN_SESSION_KEY = 'vijay_admin_session';
const CUSTOMER_SESSION_KEY = 'vijay_customer_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [customerSession, setCustomerSessionState] = useState<CustomerSession | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const adminLogin = (userId: string, password: string): boolean => {
    if (userId === ADMIN_USER_ID && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch { /* ignore */ }
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch { /* ignore */ }
  };

  const setCustomerSession = (session: CustomerSession | null) => {
    setCustomerSessionState(session);
    try {
      if (session) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
      }
    } catch { /* ignore */ }
  };

  const customerLogout = () => {
    setCustomerSession(null);
  };

  const isAuthenticated = isAdmin || customerSession !== null;

  return (
    <AuthContext.Provider value={{
      isAdmin,
      adminLogin,
      adminLogout,
      customerSession,
      setCustomerSession,
      customerLogout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
