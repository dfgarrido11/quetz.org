'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface FloatingMascotProps {
  onOpenModal: () => void;
}

export default function FloatingMascot({ onOpenModal }: FloatingMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mascotAnimClass, setMascotAnimClass] = useState('');
  const { t, isRTL } = useLanguage();

  const messages = [
    t('mascot.hello'),
    t('mascot.adopt'),
    t('mascot.help'),
    t('mascot.together'),
    t('mascot.thanks'),
  ];

  useEffect(() => {
    // Show mascot after 3 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setMascotAnimClass('mascot-entrance');
      const floatTimer = setTimeout(() => setMascotAnimClass('mascot-float'), 800);
      return () => clearTimeout(floatTimer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !hasInteracted) {
      // Show bubble after mascot appears
      const bubbleTimer = setTimeout(() => {
        setShowBubble(true);
      }, 1000);

      // Rotate messages
      const messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);

      return () => {
        clearTimeout(bubbleTimer);
        clearInterval(messageInterval);
      };
    }
  }, [isVisible, hasInteracted, messages.length]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowBubble(false);
    onOpenModal();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`fixed bottom-4 z-50 flex flex-col items-end gap-2 ${isRTL ? 'left-4 items-start' : 'right-4'}`}
        >
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: isRTL ? -20 : 20 }}
                className={`bg-white rounded-2xl shadow-lg p-3 sm:p-4 max-w-[200px] sm:max-w-[240px] relative ${isRTL ? 'ml-2' : 'mr-2'}`}
              >
                <div className={`absolute -bottom-2 w-4 h-4 bg-white transform rotate-45 ${isRTL ? 'left-8' : 'right-8'}`} />
                <p className={`text-sm sm:text-base font-medium text-gray-800 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {messages[currentMessage]}
                </p>
                <button
                  onClick={handleClick}
                  className="mt-2 w-full bg-quetz-green text-white text-xs sm:text-sm font-semibold py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('lead.submit')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mascot Container */}
          <div className={`relative ${mascotAnimClass}`}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute -top-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors ${isRTL ? '-right-2' : '-left-2'}`}
              aria-label="Close mascot"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Mascot Image */}
            <motion.button
              onClick={handleClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-xl border-4 border-white cursor-pointer bg-gradient-to-br from-quetz-green to-green-600"
            >
              <Image
                src="/mascot/quetzito-heroe.png"
                alt="Quetzito Héroe"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </motion.button>

            {/* Notification Badge */}
            {!hasInteracted && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute -top-1 bg-quetz-red text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md ${isRTL ? '-left-1' : '-right-1'}`}
              >
                <MessageCircle className="w-3 h-3" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
