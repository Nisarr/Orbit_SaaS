import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Send, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { toast } from 'sonner';


/** Parse rich markers: **bold**, [[green-card]], **[[bold+green]]**, {{white-card}}, **{{bold+white}}** */
function parseSubtitleSegments(str: string): { text: string; bold: boolean; card: boolean; whiteCard: boolean }[] {
  const parts: { text: string; bold: boolean; card: boolean; whiteCard: boolean }[] = [];
  const regex = /\*\*\[\[(.+?)\]\]\*\*|\*\*\{\{(.+?)\}\}\*\*|\*\*(.+?)\*\*|\[\[(.+?)\]\]|\{\{(.+?)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) parts.push({ text: str.slice(last, m.index), bold: false, card: false, whiteCard: false });
    if (m[1] !== undefined) parts.push({ text: m[1], bold: true, card: true, whiteCard: false });
    else if (m[2] !== undefined) parts.push({ text: m[2], bold: true, card: false, whiteCard: true });
    else if (m[3] !== undefined) parts.push({ text: m[3], bold: true, card: false, whiteCard: false });
    else if (m[4] !== undefined) parts.push({ text: m[4], bold: false, card: true, whiteCard: false });
    else if (m[5] !== undefined) parts.push({ text: m[5], bold: false, card: false, whiteCard: true });
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push({ text: str.slice(last), bold: false, card: false, whiteCard: false });
  return parts.length ? parts : [{ text: str, bold: false, card: false, whiteCard: false }];
}

/* ── Home component ───────────────────────────────────────────── */
export function Home() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const mobileEmailBarRef = useRef<HTMLDivElement>(null);
  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    const handleChatbotState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail) {
        setIsChatbotOpen(customEvent.detail.isOpen);
      }
    };
    window.addEventListener('orbit-chatbot-state-change', handleChatbotState);
    return () => window.removeEventListener('orbit-chatbot-state-change', handleChatbotState);
  }, []);

  // Track scroll position to hide newsletter button
  useEffect(() => {
    let wasVisible = true;
    const onScroll = () => {
      const hero = sectionRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
      const shouldShow = ratio < 0.15;
      if (shouldShow === wasVisible) return;
      wasVisible = shouldShow;
      setIsInHero(shouldShow);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(lang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Please enter a valid email');
      return;
    }
    setStatus('loading');
    const API_BASE = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${API_BASE}/api/leads?action=submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Hero Section' })
      });
      if (res.ok) {
        setStatus('success');
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        toast.success(lang === 'bn' ? 'ওয়েটলিস্টে যুক্ত হয়েছেন!' : 'Joined waitlist successfully!');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error(lang === 'bn' ? 'ত্রুটি হয়েছে' : 'Something went wrong');
      setStatus('idle');
    }
  };


  // Parse subtitle with rich markers
  const subtitle = t.hero.subtitle || '';
  const subtitleSegments = useMemo(() => parseSubtitleSegments(subtitle), [subtitle]);
  const isLowPerf = useMemo(() => document.documentElement.classList.contains('low-perf'), []);

  // Always play the loading animation on every page load
  const isFirstVisit = true;
  const baseDelay = 4.2;

  // Theme Customization: Forcing Emerald & Gold for this redesign
  const taglineColor = '#10b981'; // Emerald
  const titleColor = '#f59e0b';   // Amber/Gold
  const ctaGradientStart = '#10b981';
  const ctaGradientEnd = '#14b8a6';

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  // ─── Loading Sequence: Holographic Ring Portal ────────────────
  const letters = ['O', 'R', 'B', 'I', 'T'];

  // On return visits, skip loading sequence entirely
  const [step, setStep] = useState(isFirstVisit ? 0 : letters.length + 1);
  const [isHeroLoaded, setIsHeroLoaded] = useState(!isFirstVisit);
  const [ringDissolved, setRingDissolved] = useState(!isFirstVisit);

  const revealedCount = Math.min(step, letters.length);
  const showRing = step > 0 && step <= letters.length;
  const showSaaS = step > letters.length;

  useEffect(() => {
    if (!isFirstVisit) return; // Skip loading sequence on return visits
    // step 1-5: each letter materializes, step 6: SaaS, step 7: hero loaded
    const timings = [500, 1000, 1500, 2100, 2700, 3300, 4100];
    const timers: ReturnType<typeof setTimeout>[] = [];
    timings.forEach((ms, i) => {
      timers.push(setTimeout(() => {
        if (i < letters.length) setStep(i + 1);
        else if (i === letters.length) {
          setStep(letters.length + 1);
          setRingDissolved(true);
        }
        else setIsHeroLoaded(true);
      }, ms));
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Force exactly the screen height ONCE to prevent shrinking when mobile keyboard opens
  const [heroHeight, setHeroHeight] = useState('100vh');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHeroHeight(`${window.innerHeight}px`);
    }
  }, []);

  // Rigorous body scroll lock when newsletter is focused to prevent browser from auto-scrolling hero content upwards
  useEffect(() => {
    if (isNewsletterFocused && window.innerWidth < 768) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isNewsletterFocused]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex items-center justify-center overflow-x-hidden pt-0 pb-12 sm:pt-20 sm:pb-0"
      style={{ minHeight: heroHeight }}
    >

      <div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ contain: 'none' }}
      >
        <div className="px-4 sm:px-14 py-8 sm:py-10 flex flex-col justify-between items-center min-h-[550px] sm:min-h-0">
          {/* Badge — slides down with spring */}
          {t.hero.tagline && (() => {
            const line1 = t.hero.tagline;
            const line2 = (t.hero as any).tagline2 || '';
            return (
              <>
                {/* Desktop: single pill (combines both if tagline2 exists) */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="hidden sm:inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-sm font-playfair italic font-bold mb-6 tracking-wide w-auto max-w-[95%] md:text-center shrink-0 min-w-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  style={{ color: taglineColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  {line2 ? `${line1} ${line2}` : line1}
                </motion.div>

                {/* Mobile: two overlapping rectangles, offset like chain links */}
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: baseDelay + 0.3 }}
                  className="flex sm:hidden flex-col items-center w-full max-w-[95%] mx-auto mb-2 -mt-4 font-playfair italic font-bold text-[14px] tracking-wide relative"
                >
                  {/* Fusion Glow Effect (behind intersection) - Moved down to overlap */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: baseDelay + 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="absolute top-[20px] left-[52%] -translate-x-1/2 w-48 h-10 bg-gradient-to-r from-emerald-500/60 to-amber-500/60 blur-xl z-[8] mix-blend-screen pointer-events-none"
                  />

                  {/* Row 1 — slightly left, pill shaped box */}
                  <motion.div
                    initial={{ opacity: 0.2, x: -75 }}
                    animate={{ opacity: 1, x: -40 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15, delay: baseDelay + 0.4 }}
                    viewport={{ once: true }}
                    className="relative z-[9] flex items-center justify-center gap-2 px-4 py-1.5 backdrop-blur-md shadow-lg rounded-full"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid rgba(16, 185, 129, 0.6)',
                      color: taglineColor,
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] shrink-0" />
                      <span>{line1}</span>
                    </div>
                  </motion.div>
                  {/* Row 2 — slightly right, pill shaped box */}
                  {line2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 65 }}
                      animate={{ opacity: 1, x: 40 }}
                      transition={{ type: "spring", stiffness: 120, damping: 15, delay: baseDelay + 0.6 }}
                      viewport={{ once: true }}
                      className="relative z-[5] flex items-center justify-center gap-2 px-6 py-1.5 backdrop-blur-md shadow-lg rounded-full"
                      style={{
                        marginTop: '0px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1.5px solid rgba(245, 158, 11, 0.6)',
                        color: '#f59e0b',
                      }}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span>{line2}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </>
            );
          })()}

          <div className="text-foreground leading-[1] mb-2 sm:mb-10 min-h-[140px] sm:min-h-[180px] flex flex-col items-center justify-center relative">

            {/* ─── Holographic Ring Portal ────────────────── */}
            <AnimatePresence>
              {showRing && !ringDissolved && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 60,
                    damping: 14,
                    mass: 0.8,
                    opacity: { duration: 0.6, ease: 'easeOut' },
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 will-change-transform"
                >
                  <div className="orbit-ring-portal" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ORBIT SaaS title — letters materialize inside the ring */}
            <div className="flex items-center justify-center relative z-10 whitespace-nowrap">
              {/* Materialized letters */}
              {letters.map((letter, i) => (
                revealedCount > i && (
                  <motion.span
                    key={letter}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="text-[clamp(3.2rem,13vw,5.5rem)] lg:text-[6.5rem] xl:text-[7.5rem] font-poppins font-black tracking-tight inline-block will-change-transform animate-text-shimmer-orbit pb-1"
                  >
                    {letter}
                  </motion.span>
                )
              ))}

              {/* "SaaS" materializes after ring dissolves */}
              {showSaaS && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-[clamp(3.2rem,13vw,5.5rem)] lg:text-[6.5rem] xl:text-[7.5rem] font-poppins font-black tracking-tight inline-block ml-2 sm:ml-4 animate-text-shimmer-saas pb-1"
                >
                  SaaS
                </motion.span>
              )}
            </div>

            {/* Title — word-by-word reveal with blur */}
            <AnimatePresence mode="wait">
              {isHeroLoaded && (
                <motion.div
                  key={`title-${lang}`}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
                  className={`animate-title-breath mt-6 sm:mt-8 md:mt-12 text-[1.5rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-5xl font-lobster tracking-normal px-1 sm:px-4 flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 ${lang === 'bn' ? 'font-bengali font-bold' : ''}`}
                  style={{ color: titleColor }}
                >
                  {isLowPerf ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                    >
                      {t.hero.title}
                    </motion.span>
                  ) : (
                    t.hero.title.split(' ').filter(Boolean).map((word: string, wi: number) => {
                      const delay = 0.05 + wi * 0.06;
                      return (
                        <motion.span
                          key={`tw-${wi}`}
                          layout
                          initial={{ opacity: 0, y: 10, filter: 'blur(8px)', scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                          className="inline-block align-middle"
                        >
                          {word}
                        </motion.span>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtitle — word-by-word reveal with rich formatting + mid-pause */}
          <AnimatePresence mode="wait">
            <motion.p
              key={lang}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
              className="text-muted-foreground text-[12.5px] sm:text-base md:text-lg lg:text-xl w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 mt-2 sm:mt-10 mb-10 sm:mb-16 leading-[1.6] flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.45rem] sm:gap-y-3 font-medium tracking-wide"
            >
              {isLowPerf ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: isHeroLoaded ? 0 : baseDelay + 0.9 }}
                >
                  {subtitleSegments.map((seg, si) => {
                    if (!seg.bold && !seg.card && !seg.whiteCard) return <span key={si}>{seg.text}</span>;
                    const cls = [
                      seg.bold ? 'font-bold text-white' : '',
                      seg.card ? 'word-card' : '',
                      seg.whiteCard ? 'word-card-white' : '',
                    ].filter(Boolean).join(' ');
                    return <span key={si} className={`${cls} inline-block align-middle`}>{seg.text}</span>;
                  })}
                </motion.span>
              ) : (
                (() => {
                  // Count total words for mid-pause calculation
                  let totalWords = 0;
                  subtitleSegments.forEach(seg => { totalWords += seg.text.split(' ').filter(Boolean).length; });
                  const midPoint = Math.ceil(totalWords / 2);
                  const midPause = 0.6; // seconds to pause between halves

                  let wordIndex = 0;
                  return subtitleSegments.map((seg, si) => {
                    if (seg.bold || seg.card || seg.whiteCard) {
                      const wordsInSeg = seg.text.split(' ').length;
                      const pastMid = wordIndex >= midPoint;
                      const delay = (isHeroLoaded ? 0.05 : baseDelay + 0.9) + wordIndex * 0.04 + (pastMid ? midPause : 0);
                      wordIndex += wordsInSeg;
                      const cls = [
                        seg.bold ? 'font-bold text-white' : '',
                        seg.card ? 'word-card' : '',
                        seg.whiteCard ? 'word-card-white' : '',
                      ].filter(Boolean).join(' ');
                      return (
                        <motion.span
                          key={`seg-${si}`}
                          layout
                          initial={{ opacity: 0, y: 10, filter: 'blur(10px)', scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                          className={`${cls} inline-block align-middle`}
                        >
                          {seg.text}
                        </motion.span>
                      );
                    }
                    return seg.text.split(' ').filter(Boolean).map((word, wi) => {
                      const pastMid = wordIndex >= midPoint;
                      const delay = (isHeroLoaded ? 0.05 : baseDelay + 0.9) + wordIndex * 0.04 + (pastMid ? midPause : 0);
                      wordIndex++;
                      return (
                        <motion.span
                          key={`w-${si}-${wi}`}
                          layout
                          initial={{ opacity: 0, y: 10, filter: 'blur(8px)', scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                          className="inline-block align-middle"
                        >
                          {word}
                        </motion.span>
                      );
                    });
                  });
                })()
              )}
            </motion.p>
          </AnimatePresence>

          {/* CTA buttons — slide up with spring */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 16, delay: baseDelay + 1.6 }}
            className="flex flex-row w-full justify-between sm:justify-center sm:w-auto gap-4 sm:gap-10 items-center px-1 sm:px-0"
          >
            {/* Relative Container for Dropdown */}
            <div className="relative w-auto sm:w-auto">
              <motion.button
                id="hero-book-appointment"
                onClick={() => {
                  const newState = !isCtaOpen;
                  setIsCtaOpen(newState);
                  if (newState) {
                    window.dispatchEvent(new CustomEvent('orbit-cta-open'));
                  }
                }}
                whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${ctaGradientStart}44` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-bold text-primary-foreground shadow-lg gentle-animation cursor-pointer justify-center text-sm sm:text-base border-[0.5px] border-amber-400/60"
                style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
              >
                {t.hero.cta}
                <div className="ml-1.5 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                  <ChevronDown strokeWidth={2.5} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white transition-transform duration-300 ${isCtaOpen ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {isCtaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-4 w-full sm:w-[240px] z-[150] flex flex-col gap-2"
                  >
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#0d2818] flex items-center justify-center shrink-0 group-hover:bg-[#143d24] transition-colors">
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">WhatsApp</span>
                        <span className="text-[10px] text-muted-foreground font-normal leading-tight">Direct inquiry</span>
                      </div>
                    </motion.a>

                    <motion.a
                      href="mailto:contact@orbitsaas.cloud"
                      onClick={() => setIsCtaOpen(false)}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#1a2a1e] flex items-center justify-center shrink-0 group-hover:bg-[#243a28] transition-colors">
                        <Mail className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Email Us</span>
                        <span className="text-[10px] text-muted-foreground font-normal leading-tight">Send a detailed inquiry</span>
                      </div>
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.a
              href="#services"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="inline-flex items-center gap-1.5 px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-bold glass-effect text-foreground cursor-pointer justify-center text-sm sm:text-base border-[0.5px] border-amber-400/60"
            >
              {t.hero.learnMore}
            </motion.a>
          </motion.div>

        </div>{/* End Hero Container Card */}
      </div>

      {/* Full-Screen Blur Overlay for Newsletter Focus */}
      <AnimatePresence>
        {isNewsletterFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[250] bg-background/60 backdrop-blur-md"
            onClick={() => {
              if (!email) setIsNewsletterFocused(false);
              if (mobileEmailBarRef.current) {
                const input = mobileEmailBarRef.current.querySelector('input');
                if (input) input.blur();
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Newsletter — Compact button (fixed, bottom-left, inline with chatbot) */}
      {
        isHeroLoaded && !isNewsletterFocused && (
          <div
            className={`fixed bottom-[10dvh] sm:bottom-6 left-4 sm:left-6 z-[180] transition-all duration-500 ease-out ${(!isInHero || isCtaOpen || (isChatbotOpen && typeof window !== 'undefined' && window.innerWidth < 768)) ? 'opacity-0 pointer-events-none translate-y-4 scale-90 invisible' : 'opacity-100 translate-y-0 scale-100 visible'}`}
          >
            <button
              type="button"
              onClick={() => setIsNewsletterFocused(true)}
              className="flex items-center gap-2 bg-card/90 border border-primary/50 rounded-full py-2.5 pl-3.5 pr-5 text-xs font-bold text-foreground cursor-pointer newsletter-attract backdrop-blur-sm"
            >
              <Mail className="w-4 h-4 text-primary animate-bounce" />
              <span>{lang === 'bn' ? 'যুক্ত হোন' : 'Stay Updated'}</span>
            </button>
          </div>
        )
      }

      {/* Newsletter — Expanded email form (centered overlay) */}
      <AnimatePresence>
        {isHeroLoaded && isNewsletterFocused && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center px-4">
            <div className="absolute inset-0" onClick={() => { if (!email) setIsNewsletterFocused(false); }} />
            <motion.div
              ref={mobileEmailBarRef}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[420px]"
            >
              <form onSubmit={handleSubscribe} className="relative flex justify-center w-full">
                <input
                  type="email"
                  placeholder={lang === 'bn' ? 'আপনার ইমেইল...' : 'Enter your email...'}
                  value={email}
                  autoFocus
                  onBlur={() => !email && setIsNewsletterFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full bg-card/95 border border-primary/30 rounded-full py-3 pl-5 pr-[130px] text-sm shadow-2xl text-amber-500 font-bold tracking-wider placeholder:text-muted-foreground/60 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-xl"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-primary text-primary-foreground font-bold text-[12px] flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{lang === 'bn' ? 'যুক্ত হোন' : "Let's Build"}</span>
                </button>
              </form>
              {status === 'success' && (
                <p className="text-emerald-400 text-xs mt-3 text-center animate-in fade-in slide-in-from-bottom-2 font-medium">
                  {lang === 'bn' ? 'স্বাগতম!' : 'Welcome to the waitlist!'}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Scroll indicator — hidden on mobile, shown on desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ChevronDown className="w-6 h-6 text-muted-foreground opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
