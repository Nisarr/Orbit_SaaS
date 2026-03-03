import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';

export function ContactSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ctaRef.current && !ctaRef.current.contains(e.target as Node)) {
        setIsCtaOpen(false);
      }
    };
    if (isCtaOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isCtaOpen]);

  return (
    <section id="contact" className="py-10 sm:py-20 px-3 sm:px-6 relative z-20 scroll-mt-12 min-h-[50vh] flex flex-col justify-center">


      <div className="w-full mx-auto text-center relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-5 sm:py-10 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          >
            <motion.h2
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 font-display text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t.contact.title}
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t.contact.subtitle}
            </motion.p>

            {/* CTA Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.5 }}
              className="relative flex flex-col items-center justify-center w-full"
              ref={ctaRef}
            >
              <motion.button
                onClick={() => setIsCtaOpen(!isCtaOpen)}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 12px 35px rgba(108, 92, 231, 0.3)',
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 sm:px-8 py-2 sm:py-2.5 rounded-full font-bold text-base sm:text-lg text-primary-foreground bg-primary shadow-lg cursor-pointer"
              >
                {t.contact.cta}
                <div className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                  <ChevronDown strokeWidth={2.5} className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${isCtaOpen ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {isCtaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative mt-4 w-[260px] z-30 flex flex-col gap-2 mx-auto"
                  >
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-xl shadow-xl hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#1a2e24] flex items-center justify-center shrink-0 group-hover:bg-[#1f3a2b] transition-colors shadow-sm">
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">WhatsApp</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Contact directly</span>
                      </div>
                    </motion.a>

                    <motion.a
                      href="mailto:contact@orbitsaas.cloud"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-xl shadow-xl hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#211e38] flex items-center justify-center shrink-0 group-hover:bg-[#2a2445] transition-colors shadow-sm">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">Email Us</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Send a detailed inquiry</span>
                      </div>
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
