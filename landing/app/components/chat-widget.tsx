'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = { role: 'user' | 'assistant'; content: string };
type Lang = 'es' | 'de' | 'en' | 'fr' | 'ar';
type Mascot = 'quetzito' | 'quetzita';

// ─── Constants ────────────────────────────────────────────────────────────────

const MASCOTS = {
  quetzito: {
    src: '/mascot/quetzito-aventurero.png',
    name: 'Quetzito',
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  quetzita: {
    src: '/mascot/quetzito-maestro.png',
    name: 'Quetzita',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
};

const SCHOOL_KEYWORDS = /escuela|school|schule|enfants|niños|ninos|kinder|jumuzna|educaci|social|social|enfant|مدرسة|أطفال/i;

const LANG_GREETINGS: Record<Lang, string> = {
  es: '¡Hola! 🌿 Soy Quetzito, tu guía en Quetz.org. ¿Quieres adoptar un árbol, saber sobre nuestros planes o conocer la escuela Jumuzna?',
  de: 'Hallo! 🌿 Ich bin Quetzito, dein Guide bei Quetz.org. Möchtest du einen Baum adoptieren, mehr über unsere Pläne erfahren oder die Jumuzna-Schule kennenlernen?',
  en: 'Hello! 🌿 I\'m Quetzito, your guide at Quetz.org. Want to adopt a tree, learn about our plans, or discover the Jumuzna school?',
  fr: 'Bonjour ! 🌿 Je suis Quetzito, ton guide chez Quetz.org. Tu veux adopter un arbre, en savoir plus sur nos plans ou découvrir l\'école Jumuzna ?',
  ar: 'مرحباً! 🌿 أنا كيتزيتو، دليلك في Quetz.org. هل تريد تبني شجرة أو معرفة المزيد عن خططنا أو اكتشاف مدرسة خومزنا؟',
};

const VOICE_LANGS: Record<Lang, string> = {
  es: 'es-ES', de: 'de-DE', en: 'en-US', fr: 'fr-FR', ar: 'ar-SA',
};

// ─── Language detection ───────────────────────────────────────────────────────

function detectLang(text: string): Lang | null {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[äöüÄÖÜß]|(\b(ich|hallo|danke|bitte|wie|was|baum|bäume)\b)/i.test(text)) return 'de';
  if (/(\b(je|vous|nous|bonjour|merci|arbre|école)\b)/i.test(text)) return 'fr';
  if (/(\b(the|hello|hi|tree|how|what|school|please)\b)/i.test(text)) return 'en';
  if (/(\b(hola|árbol|gracias|escuela|quiero|cómo|qué|plantar)\b)/i.test(text)) return 'es';
  return null;
}

function browserLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es';
  const code = nav.slice(0, 2).toLowerCase();
  const map: Record<string, Lang> = { es: 'es', de: 'de', en: 'en', fr: 'fr', ar: 'ar' };
  return map[code] ?? 'es';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { language: siteLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<Lang>(() => {
    const map: Record<string, Lang> = { es: 'es', de: 'de', en: 'en', fr: 'fr', ar: 'ar' };
    return map[siteLanguage] ?? browserLang();
  });
  const [mascot, setMascot] = useState<Mascot>('quetzito');
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Sync language with site-level language context
  useEffect(() => {
    if (siteLanguage) {
      setLang(siteLanguage as Lang);
    }
  }, [siteLanguage]);

  // Init greeting + speech synthesis
  useEffect(() => {
    const initial = siteLanguage as Lang ?? browserLang();
    setMessages([{ role: 'assistant', content: LANG_GREETINGS[initial] }]);
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Update mascot based on last user message
  const updateMascot = useCallback((text: string) => {
    setMascot(SCHOOL_KEYWORDS.test(text) ? 'quetzita' : 'quetzito');
  }, []);

  // ─── Voice output ───────────────────────────────────────────────────────────

  const speak = useCallback((text: string, langCode: Lang) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = VOICE_LANGS[langCode];
    utt.rate = 0.95;
    synthRef.current.speak(utt);
  }, [voiceEnabled]);

  // ─── Voice input ────────────────────────────────────────────────────────────

  const toggleListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = VOICE_LANGS[lang];
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang, listening]);

  // ─── Send message ───────────────────────────────────────────────────────────

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setInput('');

    // Detect language from user text
    const detected = detectLang(text);
    const activeLang = detected ?? lang;
    if (detected) setLang(detected);
    updateMascot(text);

    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setStreaming(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language: activeLang,
          mascot: SCHOOL_KEYWORDS.test(text) ? 'quetzita' : 'quetzito',
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }

      speak(full, activeLang);
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ Hubo un error. Por favor intenta de nuevo.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, lang, streaming, speak, updateMascot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const m = MASCOTS[mascot];
  const isRTL = lang === 'ar';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 ${isRTL ? 'rtl' : 'ltr'}`}>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${m.color} p-4 flex items-center gap-3`}>
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={m.src}
                  alt={m.name}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-tight">{m.name}</p>
                <p className="text-white/80 text-xs">Quetz.org · Guatemala 🌿</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVoiceEnabled(v => !v)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="relative w-7 h-7 flex-shrink-0 mt-0.5">
                      <Image src={m.src} alt={m.name} fill className="object-contain" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gray-800 text-white rounded-tr-sm'
                        : `${m.bg} ${m.border} border text-gray-800 rounded-tl-sm`
                    }`}
                  >
                    {msg.content}
                    {msg.role === 'assistant' && streaming && i === messages.length - 1 && !msg.content && (
                      <span className="inline-flex gap-1 py-1">
                        {[0, 1, 2].map(d => (
                          <motion.span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                  listening
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={lang === 'de' ? 'Schreib eine Nachricht...' : lang === 'fr' ? 'Écris un message...' : lang === 'ar' ? 'اكتب رسالة...' : lang === 'en' ? 'Type a message...' : 'Escribe un mensaje...'}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                disabled={streaming}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="p-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating mascot button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="relative w-16 h-16 focus:outline-none"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir chat con Quetzito"
      >
        {/* Glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${m.color} opacity-30`}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mascot image */}
        <div className="relative w-16 h-16">
          <Image
            src={m.src}
            alt={m.name}
            fill
            className="object-contain drop-shadow-xl"
          />
        </div>

        {/* Blinking eye overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
        />

        {/* Thinking indicator while streaming */}
        <AnimatePresence>
          {streaming && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"
            >
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 0.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot when closed */}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}

        {/* Notification bubble on first load */}
        <AnimatePresence>
          {!open && messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 2 }}
              className="absolute right-full mr-3 bottom-3 bg-white text-gray-700 text-xs rounded-xl px-3 py-2 shadow-lg border border-gray-100 whitespace-nowrap pointer-events-none"
            >
              🌿 ¡Hola! ¿Te ayudo?
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
