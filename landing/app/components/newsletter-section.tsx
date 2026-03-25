'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Gift, Check, Loader2, TreePine, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function NewsletterSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const content = {
    de: {
      title: 'Monatlicher Impact Report',
      subtitle: 'Erhalte jeden Monat echte Updates: gepflanzte Bäume, unterstützte Familien, Schulbau-Fortschritt.',
      leadMagnet: 'Gratis: Unser erster Impact Report als PDF',
      benefits: [
        'Echte Zahlen, keine leeren Versprechen',
        'Fotos direkt aus Zacapa',
        'Transparente Mittelverwendung',
      ],
      placeholder: 'Deine E-Mail-Adresse',
      cta: 'Jetzt anmelden',
      privacy: 'Kein Spam. Jederzeit abmeldbar.',
      success: 'Willkommen! Dein erster Report ist unterwegs.',
      error: 'Bitte gib eine gültige E-Mail ein.',
    },
    es: {
      title: 'Informe de Impacto Mensual',
      subtitle: 'Recibe cada mes actualizaciones reales: árboles plantados, familias apoyadas, avance de la escuela.',
      leadMagnet: 'Gratis: Nuestro primer Informe de Impacto en PDF',
      benefits: [
        'Números reales, no promesas vacías',
        'Fotos directas desde Zacapa',
        'Uso transparente de fondos',
      ],
      placeholder: 'Tu correo electrónico',
      cta: 'Suscribirme',
      privacy: 'Sin spam. Cancela cuando quieras.',
      success: '¡Bienvenido! Tu primer informe va en camino.',
      error: 'Por favor ingresa un email válido.',
    },
    en: {
      title: 'Monthly Impact Report',
      subtitle: 'Get real updates every month: planted trees, supported families, school progress.',
      leadMagnet: 'Free: Our first Impact Report as PDF',
      benefits: [
        'Real numbers, no empty promises',
        'Photos directly from Zacapa',
        'Transparent fund usage',
      ],
      placeholder: 'Your email address',
      cta: 'Subscribe now',
      privacy: 'No spam. Unsubscribe anytime.',
      success: 'Welcome! Your first report is on its way.',
      error: 'Please enter a valid email.',
    },
    fr: {
      title: 'Rapport d\'Impact Mensuel',
      subtitle: 'Recevez chaque mois des mises à jour réelles: arbres plantés, familles soutenues, avancement de l\'école.',
      leadMagnet: 'Gratuit: Notre premier Rapport d\'Impact en PDF',
      benefits: [
        'Chiffres réels, pas de promesses vides',
        'Photos directement de Zacapa',
        'Utilisation transparente des fonds',
      ],
      placeholder: 'Votre adresse email',
      cta: 'S\'abonner',
      privacy: 'Pas de spam. Désabonnement à tout moment.',
      success: 'Bienvenue! Votre premier rapport est en route.',
      error: 'Veuillez entrer un email valide.',
    },
    ar: {
      title: 'تقرير التأثير الشهري',
      subtitle: 'احصل على تحديثات حقيقية كل شهر: الأشجار المزروعة، العائلات المدعومة، تقدم المدرسة.',
      leadMagnet: 'مجاناً: أول تقرير تأثير بصيغة PDF',
      benefits: [
        'أرقام حقيقية، لا وعود فارغة',
        'صور مباشرة من زاكابا',
        'استخدام شفاف للأموال',
      ],
      placeholder: 'عنوان بريدك الإلكتروني',
      cta: 'اشترك الآن',
      privacy: 'بدون رسائل مزعجة. إلغاء الاشتراك في أي وقت.',
      success: 'مرحباً! تقريرك الأول في الطريق.',
      error: 'يرجى إدخال بريد إلكتروني صالح.',
    },
  };

  const t = content[language] || content.de;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t.error);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language, source: 'newsletter_section' }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(t.error);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`py-16 sm:py-24 bg-gradient-to-br from-quetz-green to-green-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Left side - Benefits */}
            <div className="bg-quetz-green/5 p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-quetz-green rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-quetz-green bg-quetz-green/10 px-3 py-1 rounded-full">
                  {t.leadMagnet}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.subtitle}
              </p>
              
              <ul className="space-y-3">
                {t.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-quetz-green flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <TreePine className="w-4 h-4" />
                  <span>847+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>23</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>10.8%</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              {success ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-quetz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-quetz-green" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">{t.success}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.placeholder}
                        className={`w-full py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent transition-all text-gray-900 ${
                          isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'
                        }`}
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-quetz-green text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        {t.cta}
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500">{t.privacy}</p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
