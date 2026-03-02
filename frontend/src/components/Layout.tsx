import React from 'react';
import { Home, Grid, Package, Phone, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VijayAIChatbot from './VijayAIChatbot';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, onNavigate, onLogout }: LayoutProps) {
  const { isAdmin, customerSession, adminLogout, customerLogout } = useAuth();

  const customerTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Grid },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const adminTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Grid },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
    } else {
      customerLogout();
    }
    // Navigate to login screen after clearing session
    onLogout();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'oklch(0.14 0.04 240)', borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
            style={{ border: '1px solid oklch(0.78 0.12 85 / 40%)' }}>
            <img src="/assets/generated/vijay-logo.dim_512x512.png" alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                if (t.parentElement) t.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:800;color:oklch(0.78 0.12 85);background:oklch(0.22 0.06 240)">V</div>';
              }}
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: 'oklch(0.97 0.005 240)' }}>
              Vijay Online Centre
            </p>
            {isAdmin && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'oklch(0.78 0.12 85 / 20%)', color: 'oklch(0.78 0.12 85)', fontSize: '0.6rem' }}>
                ADMIN
              </span>
            )}
            {customerSession && !isAdmin && (
              <p className="text-xs leading-tight" style={{ color: 'oklch(0.62 0.015 240)', fontSize: '0.65rem' }}>
                {customerSession.name !== customerSession.mobile ? customerSession.name : customerSession.mobile}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ background: 'oklch(0.22 0.06 240)', color: 'oklch(0.72 0.015 240)' }}>
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav flex-shrink-0 no-print">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="flex-1 flex flex-col items-center py-3 gap-1 transition-all"
                style={{
                  color: isActive ? 'oklch(0.78 0.12 85)' : 'oklch(0.45 0.02 240)',
                }}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'oklch(0.78 0.12 85)' }} />
                  )}
                </div>
                <span className="text-xs font-medium" style={{ fontSize: '0.65rem' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vijay AI Chatbot */}
      <VijayAIChatbot />
    </div>
  );
}
