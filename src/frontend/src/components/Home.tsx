import { FileText, Package, Phone, Star } from "lucide-react";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { customerSession, isAdmin } = useAuth();
  const name = isAdmin ? "Admin" : customerSession?.name || "User";

  const quickActions = [
    {
      icon: FileText,
      label: "Apply Service",
      sublabel: "सेवा के लिए आवेदन",
      tab: "services",
      color: "oklch(0.78 0.12 85)",
    },
    {
      icon: Package,
      label: "My Orders",
      sublabel: "मेरे ऑर्डर",
      tab: "orders",
      color: "oklch(0.6 0.15 200)",
    },
    {
      icon: Phone,
      label: "Contact Us",
      sublabel: "संपर्क करें",
      tab: "contact",
      color: "oklch(0.6 0.15 145)",
    },
    {
      icon: Star,
      label: "All Services",
      sublabel: "सभी सेवाएं",
      tab: "services",
      color: "oklch(0.65 0.15 300)",
    },
  ];

  const highlights = [
    { emoji: "📄", text: "32+ Government Services" },
    { emoji: "⚡", text: "Fast Processing" },
    { emoji: "🔒", text: "Secure & Trusted" },
    { emoji: "📱", text: "24x7 Support" },
  ];

  return (
    <div
      className="min-h-full page-enter"
      style={{ background: "oklch(0.14 0.04 240)" }}
    >
      {/* Hero Section */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 240) 0%, oklch(0.22 0.06 240) 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.12 85), transparent)",
            }}
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: "2px solid oklch(0.78 0.12 85 / 40%)" }}
          >
            <img
              src="/assets/generated/vijay-logo.dim_512x512.png"
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                if (t.parentElement)
                  t.parentElement.innerHTML =
                    '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:oklch(0.22 0.06 240);font-size:1.2rem;font-weight:800;color:oklch(0.78 0.12 85)">V</div>';
              }}
            />
          </div>
          <div>
            <p
              className="text-xs font-medium"
              style={{ color: "oklch(0.72 0.015 240)" }}
            >
              Welcome back
            </p>
            <h2
              className="text-lg font-bold"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {name}
            </h2>
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: "oklch(0.18 0.05 240)",
            border: "1px solid oklch(0.28 0.07 240)",
          }}
        >
          <p
            className="text-sm font-devanagari font-medium"
            style={{ color: "oklch(0.82 0.012 240)" }}
          >
            विजय ऑनलाइन सेंटर में आपका स्वागत है
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "oklch(0.62 0.015 240)" }}
          >
            Your one-stop digital service platform for all government services
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "oklch(0.72 0.015 240)" }}
        >
          QUICK ACCESS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              type="button"
              key={action.label}
              onClick={() => onNavigate(action.tab)}
              className="p-4 rounded-2xl text-left transition-all active:scale-95"
              style={{
                background: "oklch(0.18 0.05 240)",
                border: "1px solid oklch(0.28 0.07 240)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${action.color}20` }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.97 0.005 240)" }}
              >
                {action.label}
              </p>
              <p
                className="text-xs mt-0.5 font-devanagari"
                style={{ color: "oklch(0.62 0.015 240)" }}
              >
                {action.sublabel}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="px-4 pb-4">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "oklch(0.72 0.015 240)" }}
        >
          WHY CHOOSE US
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {highlights.map((h) => (
            <div
              key={h.text}
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: "oklch(0.18 0.05 240)",
                border: "1px solid oklch(0.28 0.07 240)",
              }}
            >
              <span className="text-lg">{h.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.82 0.012 240)" }}
              >
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Banner */}
      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={() => onNavigate("contact")}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 240), oklch(0.28 0.07 240))",
            border: "1px solid oklch(0.35 0.08 240)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.5 0.15 145 / 20%)" }}
          >
            <Phone size={20} style={{ color: "oklch(0.6 0.15 145)" }} />
          </div>
          <div className="text-left">
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              Need Help?
            </p>
            <p className="text-xs" style={{ color: "oklch(0.72 0.015 240)" }}>
              Call us: +91 81730 64549
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-24 text-center">
        <p className="text-xs" style={{ color: "oklch(0.35 0.08 240)" }}>
          Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "vijay-online-centre")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "oklch(0.62 0.015 240)" }}
          >
            caffeine.ai
          </a>{" "}
          · © {new Date().getFullYear()} Vijay Online Centre
        </p>
      </div>
    </div>
  );
}
