import React, { useState } from 'react';
import { Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginCustomer, useRegisterCustomer } from '../hooks/useQueries';

interface CustomerLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register' | 'otp';

export default function CustomerLogin({ onSuccess, onBack }: CustomerLoginProps) {
  const { setCustomerSession } = useAuth();
  const loginMutation = useLoginCustomer();
  const registerMutation = useRegisterCustomer();

  const [mode, setMode] = useState<Mode>('login');
  const [loginType, setLoginType] = useState<'manual' | 'otp'>('manual');

  // Login fields
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // OTP fields
  const [otpMobile, setOtpMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginMutation.mutateAsync({ mobile, password });
      if (result) {
        // Save session with mobile as both id and name (name will be updated if available)
        setCustomerSession({ mobile, name: mobile });
        onSuccess();
      } else {
        setError('Invalid mobile number or password. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regMobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    try {
      await registerMutation.mutateAsync({ name: regName, mobile: regMobile, password: regPassword });
      setSuccess('Registration successful! Please login.');
      setMode('login');
      setMobile(regMobile);
      setPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    }
  };

  const handleSendOtp = () => {
    if (otpMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setError('');
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }
    try {
      const result = await loginMutation.mutateAsync({ mobile: otpMobile, password: 'otp_login' });
      if (result) {
        setCustomerSession({ mobile: otpMobile, name: otpMobile });
        onSuccess();
      } else {
        setError('Account not found. Please register first or use manual login.');
      }
    } catch {
      setError('Account not found. Please register first.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col navy-gradient">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-6">
        <button onClick={onBack} className="p-2 rounded-xl mr-3 transition-all active:scale-95"
          style={{ background: 'oklch(0.22 0.06 240)' }}>
          <ArrowLeft size={20} style={{ color: 'oklch(0.82 0.012 240)' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>
            {mode === 'register' ? 'Create Account' : 'Customer Login'}
          </h1>
          <p className="text-xs" style={{ color: 'oklch(0.72 0.015 240)' }}>
            {mode === 'register' ? 'Register to access services' : 'Access your services'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-16 overflow-y-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'oklch(0.22 0.06 240)', border: '2px solid oklch(0.35 0.08 240)' }}>
            <User size={28} style={{ color: 'oklch(0.78 0.12 85)' }} />
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="px-4 py-3 rounded-xl text-sm mb-4"
            style={{ background: 'oklch(0.5 0.15 145 / 20%)', border: '1px solid oklch(0.5 0.15 145 / 40%)', color: 'oklch(0.7 0.15 145)' }}>
            {success}
          </div>
        )}

        {mode === 'login' && (
          <>
            {/* Login Type Toggle */}
            <div className="flex rounded-xl p-1 mb-6"
              style={{ background: 'oklch(0.22 0.06 240)' }}>
              <button
                onClick={() => { setLoginType('manual'); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: loginType === 'manual' ? 'oklch(0.35 0.08 240)' : 'transparent',
                  color: loginType === 'manual' ? 'oklch(0.97 0.005 240)' : 'oklch(0.62 0.015 240)',
                }}
              >
                Manual Login
              </button>
              <button
                onClick={() => { setLoginType('otp'); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: loginType === 'otp' ? 'oklch(0.35 0.08 240)' : 'transparent',
                  color: loginType === 'otp' ? 'oklch(0.97 0.005 240)' : 'oklch(0.62 0.015 240)',
                }}
              >
                OTP Login
              </button>
            </div>

            {loginType === 'manual' ? (
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                      style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                      {showPassword
                        ? <EyeOff size={18} style={{ color: 'oklch(0.62 0.015 240)' }} />
                        : <Eye size={18} style={{ color: 'oklch(0.62 0.015 240)' }} />
                      }
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loginMutation.isPending}
                  className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={otpMobile}
                      onChange={e => setOtpMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                    />
                    <button onClick={handleSendOtp}
                      className="px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={{ background: 'oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}>
                      Send OTP
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: 'oklch(0.5 0.15 145 / 20%)', border: '1px solid oklch(0.5 0.15 145 / 40%)', color: 'oklch(0.7 0.15 145)' }}>
                      <p className="font-medium">Demo OTP (for testing):</p>
                      <p className="text-2xl font-bold tracking-widest mt-1">{generatedOtp}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={enteredOtp}
                        onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-widest"
                        style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                      />
                    </div>
                    <button onClick={handleVerifyOtp}
                      className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
                      Verify & Login
                    </button>
                  </>
                )}

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Don't have an account?{' '}
                <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className="font-semibold" style={{ color: 'oklch(0.78 0.12 85)' }}>
                  Register
                </button>
              </p>
            </div>
          </>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={regMobile}
                onChange={e => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.82 0.012 240)' }}>
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Create a password (min 4 characters)"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'oklch(0.22 0.06 240)', border: '1px solid oklch(0.35 0.08 240)', color: 'oklch(0.97 0.005 240)' }}
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'oklch(0.577 0.245 27.325 / 20%)', border: '1px solid oklch(0.577 0.245 27.325 / 40%)', color: 'oklch(0.85 0.15 27)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={registerMutation.isPending}
              className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))', color: 'oklch(0.14 0.04 240)' }}>
              {registerMutation.isPending ? 'Registering...' : 'Create Account'}
            </button>

            <div className="text-center">
              <button type="button" onClick={() => { setMode('login'); setError(''); }}
                className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.12 85)' }}>
                Already have an account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
