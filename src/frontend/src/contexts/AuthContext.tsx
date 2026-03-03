import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CustomerSession {
  mobile: string;
  name: string;
}

interface AdminSession {
  userId: string;
  role: "admin";
  loggedInAt: number;
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

const ADMIN_USERNAME = "vijay@123";
const ADMIN_PASSWORD = "Vijay@2026";
const ADMIN_SESSION_KEY = "vcc_admin_session";
const CUSTOMER_SESSION_KEY = "vcc_customer_session";

function loadAdminSession(): boolean {
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return false;
    const parsed: AdminSession = JSON.parse(stored);
    return parsed?.role === "admin" && !!parsed?.userId;
  } catch {
    return false;
  }
}

function saveAdminSession(userId: string) {
  try {
    const session: AdminSession = {
      userId,
      role: "admin",
      loggedInAt: Date.now(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
}

function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() =>
    loadAdminSession(),
  );

  const [customerSession, setCustomerSessionState] =
    useState<CustomerSession | null>(() => {
      try {
        const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.mobile && parsed?.name) return parsed;
        }
      } catch {
        // ignore
      }
      return null;
    });

  // Persist customer session whenever it changes
  useEffect(() => {
    try {
      if (customerSession) {
        localStorage.setItem(
          CUSTOMER_SESSION_KEY,
          JSON.stringify(customerSession),
        );
      } else {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [customerSession]);

  const adminLogin = useCallback(
    (username: string, password: string): boolean => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setIsAdminLoggedIn(true);
        saveAdminSession(username);
        return true;
      }
      return false;
    },
    [],
  );

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    clearAdminSession();
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
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        isAdmin: isAdminLoggedIn, // alias
        adminLogin,
        adminLogout,
        customerSession,
        setCustomerSession,
        customerLogin,
        customerLogout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
