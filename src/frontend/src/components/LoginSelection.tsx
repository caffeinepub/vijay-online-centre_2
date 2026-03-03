import { Shield, User } from "lucide-react";
import React from "react";

interface LoginSelectionProps {
  onAdminLogin: () => void;
  onCustomerLogin: () => void;
}

export default function LoginSelection({
  onAdminLogin,
  onCustomerLogin,
}: LoginSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col navy-gradient">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 overflow-hidden"
          style={{
            border: "2px solid oklch(0.78 0.12 85)",
            background: "oklch(0.18 0.05 240)",
          }}
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
                  '<span style="font-size:2rem;font-weight:800;color:oklch(0.78 0.12 85)">V</span>';
            }}
          />
        </div>
        <h1
          className="text-2xl font-bold text-center"
          style={{ color: "oklch(0.97 0.005 240)" }}
        >
          Vijay Online Centre
        </h1>
        <p
          className="text-sm mt-1 font-devanagari"
          style={{ color: "oklch(0.82 0.012 240)" }}
        >
          विजय ऑनलाइन सेंटर
        </p>
      </div>

      {/* Login Options */}
      <div className="flex-1 flex flex-col justify-center px-6 gap-4 pb-16">
        <p
          className="text-center text-sm mb-4"
          style={{ color: "oklch(0.72 0.015 240)" }}
        >
          Please select your login type
        </p>

        {/* Customer Login */}
        <button
          type="button"
          onClick={onCustomerLogin}
          className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 240), oklch(0.28 0.07 240))",
            border: "1px solid oklch(0.35 0.08 240)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.35 0.08 240)" }}
          >
            <User size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          </div>
          <div className="text-left">
            <p
              className="font-semibold text-base"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              Customer Login
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.72 0.015 240)" }}
            >
              Apply for services & track orders
            </p>
          </div>
        </button>

        {/* Admin Login */}
        <button
          type="button"
          onClick={onAdminLogin}
          className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.05 240), oklch(0.22 0.06 240))",
            border: "1px solid oklch(0.78 0.12 85 / 40%)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.78 0.12 85 / 20%)" }}
          >
            <Shield size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          </div>
          <div className="text-left">
            <p
              className="font-semibold text-base"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              Admin Login
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.72 0.015 240)" }}
            >
              Manage orders & settings
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center">
        <p className="text-xs" style={{ color: "oklch(0.45 0.02 240)" }}>
          © {new Date().getFullYear()} Vijay Online Centre
        </p>
      </div>
    </div>
  );
}
