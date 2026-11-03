import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Sparkles,
  Moon,
  Sun,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  User,
} from 'lucide-react';
import { AuroraBackground } from './components/AuroraBackground';
import { Message, ThemeMode } from './types';

const LOGO_SRC = '/assets/aistudio/Logo_da5a0d8d.png';

// Component to render structured markdown from Gemini (bullets, bold, code)
const FormattedMessage: React.FC<{ text: string; isAi: boolean }> = ({ text, isAi }) => {
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
              const isNumber = /^\d+\.\s/.test(trimmed);
              const content = isBullet ? trimmed.substring(2) : isNumber ? trimmed.replace(/^\d+\.\s/, '') : line;

              const renderFormattedInline = (str: string) => {
                const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
                return parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong
                        key={i}
                        className={`font-bold ${
                          isAi ? 'text-purple-300 dark:text-purple-300' : 'text-white'
                        }`}
                      >
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                      <code
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-purple-500/20 font-mono text-xs text-cyan-300"
                      >
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return part;
                });
              };

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="text-cyan-400 mt-1 shrink-0 text-base leading-none">•</span>
                    <span className="flex-1">{renderFormattedInline(content)}</span>
                  </div>
                );
              }

              if (isNumber) {
                const num = trimmed.match(/^(\d+)\./)?.[1];
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="text-purple-400 font-mono text-xs mt-0.5 shrink-0 font-semibold">
                      {num}.
                    </span>
                    <span className="flex-1">{renderFormattedInline(content)}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{renderFormattedInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Halo! Kenalin gw Agung. Ada yang mau ditanyain atau diobrolin seputar gw, kuliah Sistem Informasi di UNPAM, hobi game, atau seputar coding? Tanya santai aja bro, gas!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'Halo! Kenalin gw Agung. Ada yang mau ditanyain atau diobrolin seputar gw, kuliah Sistem Informasi di UNPAM, hobi game, atau seputar coding? Tanya santai aja bro, gas!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || input).trim();
    if (!msg || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'Santai bro, tadi agak pending dikit. Coba tanya lagi ya!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Gw Agung (19 thn, Sumedang, UNPAM S1). Koneksi lagi agak kesendat bro, kirim ulang aja ya!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const suggestions = [
    'Ceritain tentang diri lu dong bro',
    'Kuliah di UNPAM jurusan apa dan semester berapa?',
    'Apa cita-cita lu ke depan?',
    'Lagu The Shape of My Heart Backstreet Boys ceritain dong!',
    'Kalo penat habis nugas atau pulang kuliah ngapain?',
    'Asal Sumedang sebelah mana?',
  ];

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans transition-colors duration-500 selection:bg-purple-500 selection:text-white ${
        isDark ? 'text-slate-100 bg-[#090814]' : 'text-slate-800 bg-[#f8f9ff]'
      }`}
    >
      {/* Dynamic Animated Aurora Background */}
      <AuroraBackground theme={theme} />

      {/* Futuristic Minimal Header */}
      <header
        className={`relative z-20 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'border-purple-500/20 bg-slate-950/50 text-slate-200'
            : 'border-purple-100 bg-white/70 text-slate-700'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          {/* Logo Frame: Enlarged with scale to crop extra whitespace */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center p-0.5 transition-all shadow-lg overflow-hidden shrink-0 ${
              isDark
                ? 'border-purple-500/50 bg-slate-900/90 shadow-purple-500/30'
                : 'border-purple-200 bg-white shadow-purple-200'
            }`}
          >
            <img
              src={LOGO_SRC}
              alt="agungproject.id"
              className={`w-full h-full object-contain rounded-full transition-all scale-[1.65] ${
                isDark ? 'invert brightness-125 mix-blend-screen' : ''
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-white">
                Agung AI
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            </div>
            <p className="text-xs font-mono text-purple-300 font-medium tracking-wider">
              agungproject.id
            </p>
          </div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetChat}
            title="Chat Baru"
            className={`p-2.5 rounded-xl border transition-all ${
              isDark
                ? 'border-slate-800 hover:border-purple-500/40 text-slate-400 hover:text-white bg-slate-900/60 shadow-sm'
                : 'border-slate-200 hover:border-purple-300 text-slate-500 hover:text-slate-900 bg-white/80 shadow-sm'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            title={isDark ? 'Mode Terang' : 'Mode Gelap (Coding Malam Hari)'}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isDark
                ? 'border-purple-500/40 text-purple-300 hover:text-white bg-purple-950/40 shadow-sm shadow-purple-500/10'
                : 'border-blue-200 text-blue-600 hover:text-blue-800 bg-blue-50/80 shadow-sm'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </header>

      {/* Chat Messages Canvas */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl w-full mx-auto flex flex-col justify-between">
        <div className="space-y-5 pb-6">
          {messages.map((m) => {
            const isAi = m.sender === 'assistant';

            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Logo Avatar - Enlarged and clear */}
                {isAi && (
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center p-0.5 shrink-0 mt-0.5 transition-all shadow-md overflow-hidden ${
                      isDark
                        ? 'border-purple-500/50 bg-slate-900/90 shadow-purple-500/25'
                        : 'border-purple-200 bg-white shadow-purple-100'
                    }`}
                  >
                    <img
                      src={LOGO_SRC}
                      alt="Agung"
                      className={`w-full h-full object-contain rounded-full transition-all scale-[1.65] ${
                        isDark ? 'invert brightness-125 mix-blend-screen' : ''
                      }`}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 sm:px-5 py-3 transition-all ${
                    isAi
                      ? isDark
                        ? 'bg-slate-900/75 border border-purple-500/25 text-slate-100 shadow-lg shadow-purple-950/20 backdrop-blur-md'
                        : 'bg-white/95 border border-purple-200 text-slate-800 shadow-md shadow-purple-100/50 backdrop-blur-md'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-600/25 border border-white/10'
                  }`}
                >
                  {/* Structured Formatted Content */}
                  <FormattedMessage text={m.text} isAi={isAi} />

                  {/* Actions for AI Message */}
                  {isAi && (
                    <div className="flex items-center justify-end space-x-2 mt-2 pt-1.5 border-t border-purple-500/10">
                      <button
                        onClick={() => handleSpeak(m.id, m.text)}
                        title="Dengarkan Suara"
                        className="p-1 rounded text-slate-400 hover:text-purple-400 transition-colors"
                      >
                        <Volume2
                          className={`w-3.5 h-3.5 ${speakingId === m.id ? 'text-cyan-400 animate-pulse' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        title="Salin Pesan"
                        className="p-1 rounded text-slate-400 hover:text-purple-400 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAi && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/30">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Futuristic Thinking Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-400">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm ${
                  isDark ? 'border-purple-500/50 bg-slate-900/90 shadow-purple-500/25' : 'border-purple-200 bg-white'
                }`}
              >
                <img
                  src={LOGO_SRC}
                  alt="Agung"
                  className={`w-full h-full object-contain rounded-full animate-pulse scale-[1.65] ${
                    isDark ? 'invert brightness-125 mix-blend-screen' : ''
                  }`}
                />
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Minimal suggestions when only 1 message exists */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className={`text-left text-xs p-3 rounded-xl border transition-all active:scale-[0.98] ${
                    isDark
                      ? 'bg-slate-900/50 border-purple-500/20 text-slate-300 hover:border-purple-400 hover:text-white hover:bg-slate-800/60 shadow-sm'
                      : 'bg-white/85 border-purple-100 text-slate-700 hover:border-purple-300 hover:bg-purple-50/60 shadow-sm'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{s}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Minimalist Input Bar */}
      <footer className="relative z-20 w-full px-4 sm:px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div
            className={`p-2 rounded-2xl border backdrop-blur-xl transition-all shadow-xl ${
              isDark
                ? 'bg-slate-900/80 border-purple-500/30 shadow-purple-950/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20'
                : 'bg-white/95 border-purple-200 shadow-purple-100 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya apa saja tentang Agung (Sumedang, UNPAM, game favorit, coding)..."
                rows={1}
                className={`w-full py-2 px-3 text-sm resize-none outline-none bg-transparent transition-all ${
                  isDark
                    ? 'text-white placeholder-slate-500'
                    : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 border border-white/20"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
            <span>Agung AI</span>
            <span>•</span>
            <span className="text-purple-400/80">agungproject.id</span>
            <span>•</span>
            <span>UNPAM Sistem Informasi S1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
