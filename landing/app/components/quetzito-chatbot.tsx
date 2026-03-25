'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MessageCircle, Mic, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const CHATBOT_URL = 'https://apps.abacus.ai/chatllm/?appId=cb97de4f0&hideTopBar=2&voice=1&autoSpeak=1';

export default function QuetzitoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { t, language, isRTL } = useLanguage();

  // Initial visibility state - Quetzito appears after 10 seconds
  const [isVisible, setIsVisible] = useState(false);

  // Welcome message by language - updated for plans, gifts, CSR
  const welcomeMessages: Record<string, string> = {
    es: '¡Hola! Soy Quetzito, guardián de las historias de Zacapa. ¿Quieres elegir un plan mensual, hacer una donación o regalar árboles? 🌳',
    de: 'Hallo! Ich bin Quetzito, Hüter der Geschichten von Zacapa. Möchtest du einen Monatsplan wählen, spenden oder Bäume verschenken? 🌳',
    en: 'Hello! I am Quetzito, guardian of Zacapa stories. Would you like to choose a monthly plan, make a donation, or gift trees? 🌳',
    fr: 'Salut! Je suis Quetzito, gardien des histoires de Zacapa. Tu veux choisir un plan mensuel, faire un don ou offrir des arbres? 🌳',
    ar: 'مرحباً! أنا كيتزيتو، حارس قصص زاكابا. هل تريد اختيار خطة شهرية، التبرع، أو إهداء أشجار؟ 🌳',
  };

  const message = welcomeMessages[language] || welcomeMessages.es;

  useEffect(() => {
    // Quetzito appears after 10 seconds
    const appearTimer = setTimeout(() => {
      setIsVisible(true);
      setShowBubble(true);
    }, 10000);

    return () => clearTimeout(appearTimer);
  }, []);

  return (
    <>
      {/* Floating Quetzito Button - appears after 10 seconds */}
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
                    {/* Close button for bubble */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDismissed(true);
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                      aria-label="Cerrar Quetzito"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <div
                      className="cursor-pointer"
                      onClick={() => setIsOpen(true)}
                    >
                      <p className={`text-gray-800 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {message}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 text-xs text-quetz-green ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        <Mic className="w-3 h-3" />
                        <span>{language === 'es' ? 'Puedo hablar' : language === 'de' ? 'Ich kann sprechen' : language === 'en' ? 'I can speak' : language === 'fr' ? 'Je peux parler' : 'أستطيع التحدث'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Arrow pointing to mascot */}
                  <div className={`absolute ${isRTL ? 'left-8' : 'right-8'} -bottom-2 w-4 h-4 bg-white border-r border-b border-quetz-green/20 transform rotate-45`} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Button */}
            <div className="relative">
              {/* Dismiss button on mascot */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-gray-200"
                aria-label="Cerrar Quetzito"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl hover:shadow-quetz-green/30 transition-shadow border-4 border-white bg-gradient-to-br from-quetz-green to-green-600"
              >
                <Image
                  src="/mascot/quetzito-heroe.png"
                  alt="Quetzito"
                  fill
                  className="object-cover"
                />
                {/* Notification badge */}
                {!showBubble && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-quetz-red text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    ?
                  </span>
                )}
              </motion.button>
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full h-[90vh] sm:h-[85vh] sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl bg-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-quetz-green to-green-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
                    <Image
                      src="/mascot/quetzito-heroe.png"
                      alt="Quetzito"
                      fill
                      className="object-cover"
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                    <Volume2 className="w-4 h-4" />
                    <Mic className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chatbot iframe */}
              <iframe
                src={`${CHATBOT_URL}&lang=${language}`}
                className="w-full h-[calc(100%-56px)] border-0"
                title="Quetzito Chat"
                allow="microphone; autoplay"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
