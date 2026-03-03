import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Home, Layers, MessageSquare, Trophy, Users, Phone, FolderOpen, ChevronDown, MessageCircle, Mail, Star, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import orbitLogo from '@/assets/orbit-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const mobileNavItems = [
  { href: '#hero', icon: Home, label: 'Home' },
  { href: '#services', icon: Layers, label: 'Services' },
  { href: '#tech-stack', icon: Trophy, label: 'Tech' },
  { href: '#why-us', icon: MessageSquare, label: 'Why Us' },
  { href: '#project', icon: FolderOpen, label: 'Projects' },
  { href: '#reviews', icon: Star, label: 'Reviews' },
  { href: '#leadership', icon: Users, label: 'Team' },
  { href: '#contact', icon: Phone, label: 'Contact' },
];

export function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const { content } = useContent();

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavbarCTA, setShowNavbarCTA] = useState(false);
  const [isNavCtaOpen, setIsNavCtaOpen] = useState(false);
  const navCtaRef = useRef<HTMLDivElement>(null);

  // Sound defaults: ON by default, 15% volume (hardcoded)
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    const saved = localStorage.getItem('orbit_sound_muted');
    if (saved !== null) return saved === 'true';
    return false; // Sound ON by default
  });

  const [isSounding, setIsSounding] = useState(false);

  // Initialize volume to 15% for new visitors & clear stale mute preference
  useEffect(() => {
    if (localStorage.getItem('orbit_sound_volume') === null) {
      localStorage.setItem('orbit_sound_volume', '15');
    }
    // One-time migration: reset old admin-set mute preference
    // (admin controls removed — hardcoded to sound ON)
    if (localStorage.getItem('orbit_sound_migrated_v2') === null) {
      localStorage.setItem('orbit_sound_muted', 'false');
      localStorage.setItem('orbit_sound_migrated_v2', '1');
      setIsSoundMuted(false);
      window.dispatchEvent(new Event('orbit-sound-toggle'));
    }
  }, []);

  // Listen for collision events to briefly light up the sound icon
  useEffect(() => {
    let timeoutId: number;
    const handleCollision = () => {
      // Only light up if sound is ON and we are near the top (where hero sound plays)
      if (!isSoundMuted && window.scrollY < window.innerHeight * 0.8) {
        setIsSounding(true);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setIsSounding(false), 400);
      }
    };
    window.addEventListener('orbit-collision', handleCollision);
    return () => {
      window.removeEventListener('orbit-collision', handleCollision);
      clearTimeout(timeoutId);
    };
  }, [isSoundMuted]);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    localStorage.setItem('orbit_sound_muted', String(next));
    window.dispatchEvent(new Event('orbit-sound-toggle'));
  };

  // Close navbar CTA dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navCtaRef.current && !navCtaRef.current.contains(e.target as Node)) {
        setIsNavCtaOpen(false);
      }
    };
    if (isNavCtaOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isNavCtaOpen]);

  // Unified scroll handler — deferred section detection to avoid lag
  useEffect(() => {
    let rafId = 0;
    let sectionTimer = 0;

    // Track previous values to avoid unnecessary React re-renders
    let prevScrolled = isScrolled;
    let prevSection = activeSection;
    let prevShowCTA = showNavbarCTA;

    const detectSection = () => {
      sectionTimer = 0;
      if (location.pathname !== '/') {
        if (prevSection !== '') {
          prevSection = '';
          setActiveSection('');
        }
        return;
      }

      const sections = ['hero', 'services', 'tech-stack', 'why-us', 'project', 'reviews', 'leadership', 'contact'];
      let current = 'hero';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = id;
          }
        }
      }
      const nextSection = `#${current}`;
      if (nextSection !== prevSection) {
        prevSection = nextSection;
        setActiveSection(nextSection);
      }

      // CTA visibility
      const heroBtn = document.getElementById('hero-book-appointment');
      const contactEl = document.getElementById('contact');
      const contactVisible = contactEl ? contactEl.getBoundingClientRect().top < window.innerHeight * 0.75 : false;
      let nextShowCTA: boolean;
      if (heroBtn) {
        const rect = heroBtn.getBoundingClientRect();
        nextShowCTA = rect.top < -50 && !contactVisible;
      } else {
        nextShowCTA = !contactVisible;
      }
      if (nextShowCTA !== prevShowCTA) {
        prevShowCTA = nextShowCTA;
        setShowNavbarCTA(nextShowCTA);
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;

        // isScrolled — immediate (affects navbar appearance)
        const scrolled = window.scrollY > 50;
        if (scrolled !== prevScrolled) {
          prevScrolled = scrolled;
          setIsScrolled(scrolled);
        }

        // Section detection — run almost immediately (1 frame delay)
        if (sectionTimer) clearTimeout(sectionTimer);
        sectionTimer = window.setTimeout(detectSection, 16);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (sectionTimer) clearTimeout(sectionTimer);
    };
  }, [location.pathname]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const id = href.substring(1);
      const el = document.getElementById(id);
      if (el) {
        const doScroll = () => {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href);
        };
        if ((document as any).startViewTransition) {
          (document as any).startViewTransition(doScroll);
        } else {
          doScroll();
        }
      }
    } else {
      navigate('/' + href);
    }
  };

  const links = [
    { href: '#services', label: t.nav.services },
    { href: '#tech-stack', label: t.nav.techStack },
    { href: '#why-us', label: t.nav.whyUs },
    { href: '#project', label: (t.nav as any).projects ?? 'Projects' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#leadership', label: t.nav.leadership },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <>
      {/* Desktop top navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 w-full z-[110] px-3 sm:px-4 md:px-6 lg:px-10 pt-3"
      >
        <div className={`navbar-gradient-border w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 transition-all duration-500 ease-in-out rounded-full ${isScrolled ? 'bg-[#0a0a0f] shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}>
              <img
                src={orbitLogo}
                alt="ORBIT SaaS Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full"
              />
              <span className="font-display text-foreground text-base sm:text-xl font-bold tracking-wider">ORBIT</span>
            </motion.div>

            {/* Desktop nav links */}
            <motion.div
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="hidden md:flex items-center gap-2"
            >
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => scrollToSection(e, l.href)}
                  className={`relative px-4 py-1.5 rounded-full border font-medium text-sm transition-colors duration-300 ${activeSection === l.href
                    ? 'text-primary-foreground border-transparent'
                    : 'border-[#2a2a3e] text-[#b0b0c0] hover:text-foreground hover:border-[#3a3a50] hover:bg-[#141420]'
                    }`}
                >
                  {activeSection === l.href && (
                    <motion.div
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-primary"
                      transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </a>
              ))}
            </motion.div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <AnimatePresence>
                {showNavbarCTA && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, width: 0, x: 10 }}
                    animate={{ opacity: 1, scale: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, width: 0, x: 10 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                    className="hidden sm:flex shrink-0 overflow-visible relative"
                    ref={navCtaRef}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsNavCtaOpen(!isNavCtaOpen)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm text-primary-foreground bg-gradient-to-r from-primary to-amber-500/80 shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] gentle-animation cursor-pointer mr-1 sm:mr-2 transform-gpu whitespace-nowrap"
                    >
                      {t.nav.bookCall}
                      <div className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white/20 border border-white/30">
                        <ChevronDown strokeWidth={2.5} className={`w-3 h-3 text-white transition-transform duration-300 ${isNavCtaOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isNavCtaOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-3 w-[220px] z-30 flex flex-col gap-2"
                        >
                          <motion.a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsNavCtaOpen(false)}
                            whileHover={{ scale: 1.02, x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 px-3 py-2.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#1a2e24] flex items-center justify-center shrink-0 group-hover:bg-[#1f3a2b] transition-colors">
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm">WhatsApp</span>
                              <span className="text-[10px] text-muted-foreground font-normal leading-tight">Direct inquiry</span>
                            </div>
                          </motion.a>

                          <motion.a
                            href="mailto:contact@orbitsaas.cloud"
                            onClick={() => setIsNavCtaOpen(false)}
                            whileHover={{ scale: 1.02, x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 px-3 py-2.5 bg-secondary border border-border rounded-lg shadow-lg hover:border-primary/50 transition-colors text-foreground font-semibold group"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#211e38] flex items-center justify-center shrink-0 group-hover:bg-[#2a2445] transition-colors">
                              <Mail className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm">Email Us</span>
                              <span className="text-[10px] text-muted-foreground font-normal leading-tight">Send a detailed inquiry</span>
                            </div>
                          </motion.a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={toggleLang} className="bg-[#12121a] border border-[#2a2a3e] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-foreground hover:bg-[#1a1a2e] gentle-animation flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium cursor-pointer shrink-0">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>

              <button
                onClick={toggleSound}
                title={isSoundMuted ? 'Sound OFF' : 'Sound ON'}
                className={`border p-1.5 sm:p-2 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-all duration-300 ${isSounding
                  ? 'bg-amber-400/20 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110 text-amber-400'
                  : 'bg-[#12121a] border-[#2a2a3e] hover:bg-[#1a1a2e] text-foreground scale-100'
                  }`}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile bottom pill navbar — hidden on project pages */}
      {!location.pathname.startsWith('/project') && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="md:hidden fixed bottom-[2dvh] left-4 right-4 z-[120]"
        >
          <div className="navbar-gradient-border flex items-center gap-0 px-2 py-2 rounded-[22px] bg-[#0a0a0f] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-x-auto scrollbar-hide mx-auto w-fit max-w-full">
            {links.map((link) => {
              const isActive = activeSection === link.href;
              // Map href to icon
              const Icon = mobileNavItems.find(i => i.href === link.href)?.icon || Layers;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(e, link.href);
                    setActiveSection(link.href);
                  }}
                  className="relative"
                >
                  <div
                    className={`relative flex items-center gap-1.5 rounded-full cursor-pointer transition-all duration-300 ${isActive
                      ? 'px-2.5 py-1.5'
                      : 'px-1.5 py-1.5 hover:bg-[#141420]'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active-pill"
                        className="absolute inset-0 rounded-full bg-primary/20 border border-primary/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                      />
                    )}
                    <Icon className={`relative z-10 w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.span
                          key={link.href}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                          className="relative z-10 text-xs font-semibold text-primary whitespace-nowrap overflow-hidden"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
}
