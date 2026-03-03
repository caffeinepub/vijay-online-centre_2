import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { adminLogin } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = adminLogin(userId, password);
      if (success) {
        onSuccess();
      } else {
        setError(
          "Invalid credentials. Please check your User ID and Password.",
        );
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col navy-gradient">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl mr-3 transition-all active:scale-95"
          style={{ background: "oklch(0.22 0.06 240)" }}
        >
          <ArrowLeft size={20} style={{ color: "oklch(0.82 0.012 240)" }} />
        </button>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.97 0.005 240)" }}
          >
            Admin Login
          </h1>
          <p className="text-xs" style={{ color: "oklch(0.72 0.015 240)" }}>
            Secure admin access
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.22 0.06 240)",
              border: "2px solid oklch(0.78 0.12 85 / 40%)",
            }}
          >
            <Shield size={36} style={{ color: "oklch(0.78 0.12 85)" }} />
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* User ID */}
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium mb-2"
              style={{ color: "oklch(0.82 0.012 240)" }}
            >
              Admin User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter admin user ID"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "oklch(0.22 0.06 240)",
                border: "1px solid oklch(0.35 0.08 240)",
                color: "oklch(0.97 0.005 240)",
              }}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: "oklch(0.82 0.012 240)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.22 0.06 240)",
                  border: "1px solid oklch(0.35 0.08 240)",
                  color: "oklch(0.97 0.005 240)",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    style={{ color: "oklch(0.62 0.015 240)" }}
                  />
                ) : (
                  <Eye size={18} style={{ color: "oklch(0.62 0.015 240)" }} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "oklch(0.577 0.245 27.325 / 20%)",
                border: "1px solid oklch(0.577 0.245 27.325 / 40%)",
                color: "oklch(0.85 0.15 27)",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60 mt-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))",
              color: "oklch(0.14 0.04 240)",
            }}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
