import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CustomerSession {
  mobile: string;
  name: string;
}

interface AuthContextType {
  // Admin
  isAdminLoggedIn: boolean;
  isAdmin: boolean; // alias for isAdminLoggedIn
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;

  // Customer
  customerSession: CustomerSession | null;
  setCustomerSession: (session: CustomerSession | null) => void; // backward compat alias
  customerLogin: (mobile: string, name: string) => void;
  customerLogout: () => void;

  // General
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_USERNAME = 'vijay@123';
const ADMIN_PASSWORD = 'vijay@123';
const ADMIN_SESSION_KEY = 'vcc_admin_session';
const CUSTOMER_SESSION_KEY = 'vcc_customer_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [customerSession, setCustomerSessionState] = useState<CustomerSession | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.mobile && parsed.name) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Persist admin session whenever it changes
  useEffect(() => {
    try {
      if (isAdminLoggedIn) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [isAdminLoggedIn]);

  // Persist customer session whenever it changes
  useEffect(() => {
    try {
      if (customerSession) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerSession));
      } else {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [customerSession]);

  const adminLogin = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const customerLogin = useCallback((mobile: string, name: string) => {
    const session: CustomerSession = { mobile, name };
    setCustomerSessionState(session);
    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, []);

  // Backward-compatible setter that accepts a full session object or null
  const setCustomerSession = useCallback((session: CustomerSession | null) => {
    setCustomerSessionState(session);
    try {
      if (session) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const customerLogout = useCallback(() => {
    setCustomerSessionState(null);
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isAuthenticated = isAdminLoggedIn || customerSession !== null;

  return (
    <AuthContext.Provider value={{
      isAdminLoggedIn,
      isAdmin: isAdminLoggedIn, // alias
      adminLogin,
      adminLogout,
      customerSession,
      setCustomerSession,
      customerLogin,
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
