import React from 'react';
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

const PHONE = '+918173064549';
const PHONE_DISPLAY = '+91 81730 64549';
const WHATSAPP_URL = 'https://wa.me/918173064549';
const MAPS_URL = 'https://maps.google.com/?q=Vijay+Online+Centre+UP+India';

export default function Contact() {
  return (
    <div className="min-h-full page-enter" style={{ background: 'oklch(0.14 0.04 240)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4"
        style={{ borderBottom: '1px solid oklch(0.22 0.06 240)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'oklch(0.97 0.005 240)' }}>Contact Us</h1>
        <p className="text-xs mt-1 font-devanagari" style={{ color: 'oklch(0.62 0.015 240)' }}>
          संपर्क करें — हम यहाँ हैं आपकी मदद के लिए
        </p>
      </div>

      <div className="px-4 py-6 pb-24 space-y-4">
        {/* Phone Number Display */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg, oklch(0.18 0.05 240), oklch(0.22 0.06 240))', border: '2px solid oklch(0.78 0.12 85 / 40%)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'oklch(0.78 0.12 85 / 15%)' }}>
            <Phone size={28} style={{ color: 'oklch(0.78 0.12 85)' }} />
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'oklch(0.62 0.015 240)' }}>
            HELPLINE NUMBER
          </p>
          <p className="text-2xl font-bold tracking-wide" style={{ color: 'oklch(0.97 0.005 240)' }}>
            {PHONE_DISPLAY}
          </p>
          <p className="text-xs mt-1 font-devanagari" style={{ color: 'oklch(0.72 0.015 240)' }}>
            24x7 उपलब्ध
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 w-full"
            style={{ background: 'oklch(0.4 0.15 145 / 15%)', border: '1px solid oklch(0.4 0.15 145 / 40%)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(0.4 0.15 145 / 20%)' }}>
              <SiWhatsapp size={24} style={{ color: 'oklch(0.55 0.15 145)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.97 0.005 240)' }}>
                WhatsApp Chat
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Chat with us on WhatsApp
              </p>
            </div>
          </a>

          {/* Direct Call */}
          <a
            href={`tel:${PHONE}`}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 w-full"
            style={{ background: 'oklch(0.6 0.15 200 / 15%)', border: '1px solid oklch(0.6 0.15 200 / 40%)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(0.6 0.15 200 / 20%)' }}>
              <Phone size={24} style={{ color: 'oklch(0.6 0.15 200)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Direct Call
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                {PHONE_DISPLAY}
              </p>
            </div>
          </a>

          {/* Google Maps */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 w-full"
            style={{ background: 'oklch(0.65 0.15 27 / 15%)', border: '1px solid oklch(0.65 0.15 27 / 40%)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(0.65 0.15 27 / 20%)' }}>
              <MapPin size={24} style={{ color: 'oklch(0.65 0.15 27)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Find on Google Maps
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Get directions to our centre
              </p>
            </div>
          </a>

          {/* Email placeholder */}
          <div className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(0.35 0.08 240)' }}>
              <Mail size={24} style={{ color: 'oklch(0.82 0.012 240)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.97 0.005 240)' }}>
                Business Hours
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.62 0.015 240)' }}>
                Mon–Sat: 9:00 AM – 7:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl p-4"
          style={{ background: 'oklch(0.18 0.05 240)', border: '1px solid oklch(0.28 0.07 240)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'oklch(0.97 0.005 240)' }}>
            Vijay Online Centre
          </p>
          <p className="text-xs leading-relaxed font-devanagari" style={{ color: 'oklch(0.72 0.015 240)' }}>
            सरकारी सेवाओं के लिए आपका विश्वसनीय डिजिटल केंद्र।
            हम आपकी सभी सरकारी दस्तावेज़ और ऑनलाइन सेवाओं में मदद करते हैं।
          </p>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'oklch(0.62 0.015 240)' }}>
            Your trusted digital centre for all government services and documentation.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs" style={{ color: 'oklch(0.35 0.08 240)' }}>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'vijay-online-centre')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'oklch(0.55 0.015 240)' }}
            >
              caffeine.ai
            </a>
            {' '}· © {new Date().getFullYear()} Vijay Online Centre
          </p>
        </div>
      </div>
    </div>
  );
}
