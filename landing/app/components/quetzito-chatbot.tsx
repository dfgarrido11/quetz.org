'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import dynamic from 'next/dynamic';

// Dynamic import for 3D Quetzito component
const QuetzitoEngine = dynamic(
  () => import('@/components/quetzito/QuetzitoEngine'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Image src="/mascot/quetzito-heroe.png" alt="Quetzito" fill className="object-cover animate-pulse" />
      </div>
    )
  }
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function QuetzitoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, isRTL } = useLanguage();

  const welcomeMessages: Record<string, string> = {
    es: '¡Hola! Soy Quetzito, guardián de las historias de Zacapa. ¿Quieres elegir un plan mensual, hacer una donación o regalar árboles? 🌳',
    de: 'Hallo! Ich bin Quetzito, Hüter der Geschichten von Zacapa. Möchtest du einen Monatsplan wählen, spenden oder Bäume verschenken? 🌳',
    en: 'Hello! I am Quetzito, guardian of Zacapa stories. Would you like to choose a monthly plan, make a donation, or gift trees? 🌳',
    fr: 'Salut! Je suis Quetzito, gardien des histoires de Zacapa. Tu veux choisir un plan mensuel, faire un don ou offrir des arbres? 🌳',
    ar: 'مرحباً! أنا كيتزيتو، حارس قصص زاكابا. هل تريد اختيار خطة شهرية، التبرع، أو إهداء أشجار؟ 🌳',
  };

  const welcomeMessage = welcomeMessages[language] || welcomeMessages.es;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowBubble(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: language === 'de' ? 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuche es erneut.' : 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Quetzito Button */}
      <AnimatePresence>
        {isVisible && !isDismissed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50`}
          >
            {/* Speech Bubble */}
            <AnimatePresence>
              {showBubble && !isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className={`absolute bottom-full ${isRTL ? 'left-0' : 'right-0'} mb-3 w-56`}
                >
                  <div className="relative bg-white rounded-2xl p-4 shadow-xl border border-quetz-green/20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                      aria-label="Cerrar Quetzito"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
                      <p className={`text-gray-800 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {welcomeMessage}
                      </p>
                    </div>
                  </div>
                  <div className={`absolute ${isRTL ? 'left-8' : 'right-8'} -bottom-2 w-4 h-4 bg-white border-r border-b border-quetz-green/20 transform rotate-45`} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Button */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-gray-200"
                aria-label="Cerrar Quetzito"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl hover:shadow-quetz-green/30 transition-shadow border-4 border-white bg-gradient-to-br from-quetz-green to-green-600 cursor-pointer"
              >
                <QuetzitoEngine
                  position="chat"
                  width={80}
                  height={80}
                  className="w-full h-full"
                  onClick={() => {
                    setIsOpen(true);
                    console.log('🎉 ¡Quetzito chat activado!');
                  }}
                  fallback={
                    <Image src="/mascot/quetzito-heroe.png" alt="Quetzito" fill className="object-cover" />
                  }
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full h-[90vh] sm:h-[85vh] sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-quetz-green to-green-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
                    <QuetzitoEngine
                      position="chat"
                      width={40}
                      height={40}
                      className="w-full h-full"
                      fallback={
                        <Image src="/mascot/quetzito-heroe.png" alt="Quetzito" fill className="object-cover" />
                      }
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Quetzito</h3>
                    <p className="text-xs text-white/80">
                      {language === 'es' ? 'Guardián de historias de Zacapa' :
                       language === 'de' ? 'Hüter der Geschichten von Zacapa' :
                       language === 'en' ? 'Guardian of Zacapa stories' :
                       language === 'fr' ? 'Gardien des histoires de Zacapa' :
                       'حارس قصص زاكابا'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mr-2 mt-1">
                        <QuetzitoEngine
                          position="chat"
                          width={28}
                          height={28}
                          className="w-full h-full"
                          fallback={
                            <Image src="/mascot/quetzito-heroe.png" alt="Quetzito" width={28} height={28} className="object-cover" />
                          }
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-quetz-green text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mr-2 mt-1">
                      <Image src="/mascot/quetzito-heroe.png" alt="Quetzito" width={28} height={28} className="object-cover" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-quetz-green" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      language === 'de' ? 'Schreib Quetzito...' :
                      language === 'en' ? 'Message Quetzito...' :
                      'Escribe a Quetzito...'
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quetz-green/30 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-quetz-green text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
