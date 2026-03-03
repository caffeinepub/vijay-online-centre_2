import { Bot, MessageCircle, Send, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { getBotResponse } from "../data/chatbotResponses";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "0",
  text: "नमस्ते! 🙏 मैं Vijay AI हूँ — आपका 24x7 सहायक।\n\nHello! I am Vijay AI, your 24x7 assistant.\n\nHow can I help you today? / आज मैं आपकी कैसे मदद कर सकता हूँ?",
  isBot: true,
  timestamp: new Date(),
};

export default function VijayAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="no-print fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))",
          boxShadow: "0 4px 20px oklch(0.72 0.14 85 / 50%)",
        }}
      >
        {isOpen ? (
          <X size={22} style={{ color: "oklch(0.14 0.04 240)" }} />
        ) : (
          <MessageCircle size={22} style={{ color: "oklch(0.14 0.04 240)" }} />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="no-print fixed bottom-36 right-4 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
          style={{
            background: "oklch(0.14 0.04 240)",
            border: "1px solid oklch(0.28 0.07 240)",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Chat Header */}
          <div
            className="flex items-center gap-3 p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.05 240), oklch(0.22 0.06 240))",
              borderBottom: "1px solid oklch(0.28 0.07 240)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.14 85), oklch(0.82 0.12 85))",
              }}
            >
              <Bot size={18} style={{ color: "oklch(0.14 0.04 240)" }} />
            </div>
            <div className="flex-1">
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.97 0.005 240)" }}
              >
                Vijay AI
              </p>
              <div className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full pulse-dot"
                  style={{ background: "oklch(0.6 0.15 145)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.62 0.015 240)" }}
                >
                  24x7 Assistant
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1"
            >
              <X size={16} style={{ color: "oklch(0.62 0.015 240)" }} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                {msg.isBot && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                    style={{ background: "oklch(0.78 0.12 85 / 20%)" }}
                  >
                    <Bot size={12} style={{ color: "oklch(0.78 0.12 85)" }} />
                  </div>
                )}
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line"
                  style={{
                    background: msg.isBot
                      ? "oklch(0.22 0.06 240)"
                      : "oklch(0.78 0.12 85)",
                    color: msg.isBot
                      ? "oklch(0.82 0.012 240)"
                      : "oklch(0.14 0.04 240)",
                    borderRadius: msg.isBot
                      ? "4px 16px 16px 16px"
                      : "16px 4px 16px 16px",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-3 flex gap-2"
            style={{ borderTop: "1px solid oklch(0.22 0.06 240)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: "oklch(0.22 0.06 240)",
                border: "1px solid oklch(0.35 0.08 240)",
                color: "oklch(0.97 0.005 240)",
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
              style={{ background: "oklch(0.78 0.12 85)" }}
            >
              <Send size={14} style={{ color: "oklch(0.14 0.04 240)" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
