import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center navy-gradient z-50 splash-fade">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, oklch(0.82 0.012 240), transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, oklch(0.82 0.012 240), transparent)', transform: 'translate(30%, 30%)' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.12 85), transparent)', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Logo */}
      <div className="relative mb-6 animate-scale-in">
        <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
          style={{ border: '3px solid oklch(0.78 0.12 85)', background: 'oklch(0.18 0.05 240)' }}>
          <img
            src="/assets/generated/vijay-logo.dim_512x512.png"
            alt="Vijay Online Centre"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span style="font-size:3rem;font-weight:800;color:oklch(0.78 0.12 85)">V</span>';
              }
            }}
          />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ border: '2px solid oklch(0.78 0.12 85)' }} />
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-center mb-2 animate-fade-in"
        style={{ color: 'oklch(0.97 0.005 240)', letterSpacing: '0.02em' }}>
        Vijay Online Centre
      </h1>
      <p className="text-sm font-medium mb-8 animate-fade-in"
        style={{ color: 'oklch(0.78 0.12 85)', letterSpacing: '0.1em' }}>
        DIGITAL SERVICES PLATFORM
      </p>

      {/* Hindi Welcome Message */}
      <div className="px-8 py-4 rounded-2xl text-center animate-fade-in mx-4"
        style={{ background: 'oklch(0.18 0.05 240 / 80%)', border: '1px solid oklch(0.35 0.08 240)' }}>
        <p className="text-lg font-semibold font-devanagari leading-relaxed"
          style={{ color: 'oklch(0.82 0.012 240)' }}>
          स्वागत है आपका हमारे
        </p>
        <p className="text-lg font-semibold font-devanagari leading-relaxed"
          style={{ color: 'oklch(0.78 0.12 85)' }}>
          विजय ऑनलाइन प्लेटफ़ॉर्म पर
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full pulse-dot"
            style={{
              background: 'oklch(0.78 0.12 85)',
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
