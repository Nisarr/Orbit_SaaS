import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import orbitLogo from '@/assets/orbit-logo.png';
import {
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Twitter,
  Youtube,
  Github,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const PLATFORM_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  telegram: Send,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  whatsapp: MessageCircle,
};

export function OrbitFooter() {
  const { t } = useLang();

  const footer = t.footer as any;
  const brandName = footer.brandName || 'ORBIT SaaS';
  const email = footer.email || '';
  const phone = footer.phone || '';
  const location = footer.location || '';
  const madeWith = footer.madeWith || '';

  // Pull service names from content
  const serviceItems: { title: string }[] = (t.services as any)?.items || [];
  // Pull why-us reasons from content
  const whyUsItems: { title: string }[] = (t.whyUs as any)?.items || [];

  // Get enabled socials with valid URLs
  const socials = (footer.socials || []).filter(
    (s: any) => s.enabled && s.url
  );

  const hasContactInfo = email || phone || location;

  return (
    <footer className="relative w-full pt-16 pb-24 sm:pb-12 mt-16 overflow-hidden">
      {/* Dynamic Glowing Top Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(108,92,231,0.5)]" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      {/* Faint Upward Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12">

        {/* ─── Contained Footer Card ─── */}
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-12">

          {/* ─── Main Grid ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-5 md:gap-5 items-start">

            {/* ── Col 1: Brand + Contact Info (full width on mobile) ── */}
            <div className="col-span-2 sm:col-span-2 md:col-span-4 space-y-4 rounded-2xl border border-border/40 p-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-amber-400 opacity-30 blur-sm mix-blend-screen" />
                  <img
                    src={orbitLogo}
                    alt={brandName}
                    className="relative w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                  />
                </div>
                <span className="font-display font-bold text-lg text-foreground tracking-tight">
                  {brandName}
                </span>
              </div>

              {/* Tagline */}
              {footer.tagline && (
                <p className="text-muted-foreground/80 max-w-xs text-sm leading-relaxed">
                  {footer.tagline}
                </p>
              )}

              {/* Contact Details */}
              {hasContactInfo && (
                <div className="space-y-2 pt-1">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-primary transition-colors group"
                    >
                      <Mail className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary" strokeWidth={1.8} />
                      <span>{email}</span>
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-primary transition-colors group"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary" strokeWidth={1.8} />
                      <span>{phone}</span>
                    </a>
                  )}
                  {location && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground/70">
                      <MapPin className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Col 2: Services ── */}
            {serviceItems.length > 0 && (
              <div className="col-span-1 md:col-span-3 rounded-2xl border border-border/40 p-6">
                <h4 className="inline-block text-xs font-semibold text-foreground uppercase tracking-wider mb-3 px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
                  Services
                </h4>
                <ul className="space-y-2">
                  {serviceItems.map((item, idx) => (
                    <li key={idx}>
                      <a
                        href="#services"
                        className="text-sm text-muted-foreground/70 hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Col 3: Why Us ── */}
            {whyUsItems.length > 0 && (
              <div className="col-span-1 md:col-span-3 rounded-2xl border border-border/40 p-6">
                <h4 className="inline-block text-xs font-semibold text-foreground uppercase tracking-wider mb-3 px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
                  Why Us
                </h4>
                <ul className="space-y-2">
                  {whyUsItems.map((item, idx) => (
                    <li key={idx}>
                      <a
                        href="#why-us"
                        className="text-sm text-muted-foreground/70 hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Col 4: Legal ── */}
            <div className="col-span-1 md:col-span-2 rounded-2xl border border-border/40 p-6">
              <h4 className="inline-block text-xs font-semibold text-foreground uppercase tracking-wider mb-3 px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground/70 hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground/70 hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright + Made With — pill border */}
              <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-muted-foreground/60 text-xs sm:text-sm rounded-full border border-border/40 px-5 py-2.5">
                <span>{footer.rights}</span>
                {madeWith && (
                  <>
                    <span className="text-border/60 select-none">·</span>
                    <span>{madeWith}</span>
                  </>
                )}
              </div>

              {/* Social Icons */}
              {socials.length > 0 && (
                <div className="flex items-center gap-2.5">
                  {socials.map((social: any) => {
                    const Icon = PLATFORM_ICONS[social.platform];
                    if (!Icon) return null;
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.platform}
                        className="group relative w-9 h-9 rounded-xl bg-secondary/60 hover:bg-primary/10 border border-border/80 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 pointer-events-none" />
                        <Icon className="relative w-4 h-4 z-10" strokeWidth={1.8} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
