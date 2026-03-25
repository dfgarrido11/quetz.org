'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { X, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const galleryImages = [
  { id: 1, src: '/photos/gallery1.jpg', alt: 'Paisaje de Zacapa 1' },
  { id: 2, src: '/photos/gallery2.jpg', alt: 'Paisaje de Zacapa 2' },
  { id: 3, src: '/photos/gallery3.jpg', alt: 'Paisaje de Zacapa 3' },
  { id: 4, src: '/photos/gallery4.jpg', alt: 'Paisaje de Zacapa 4' },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();

  return (
    <section id="zacapa" className={`py-20 sm:py-28 bg-quetz-cream ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin className="w-6 h-6 text-quetz-blue" />
            <span className="text-quetz-blue font-semibold text-sm uppercase tracking-wider">Guatemala</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            {t('gallery.title')}
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {galleryImages?.map?.((img, index) => (
            <motion.div
              key={img?.id ?? index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => setSelectedImage(img?.src ?? null)}
            >
              <div className={`relative ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-200`}>
                <Image
                  src={img?.src ?? ''}
                  alt={img?.alt ?? 'Paisaje de Zacapa'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </motion.div>
          )) ?? null}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white p-2 hover:bg-white/20 rounded-full transition-colors`}
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Vista ampliada"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
