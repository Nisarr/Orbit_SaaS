import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Cpu, Crown, Target, User } from 'lucide-react';

const fallbackStyles = [
  { icon: Cpu, gradient: 'linear-gradient(135deg, #6c5ce7, #3b82f6)', shadow: '0 8px 30px rgba(108, 92, 231, 0.35)' },
  { icon: Crown, gradient: 'linear-gradient(135deg, #0891b2, #6c5ce7)', shadow: '0 8px 30px rgba(8, 145, 178, 0.35)' },
  { icon: Target, gradient: 'linear-gradient(135deg, #d946a8, #6c5ce7)', shadow: '0 8px 30px rgba(217, 70, 168, 0.35)' },
];

// Animations removed to prevent mobile scroll layout shifting

const FALLBACK_MEMBERS = [
  { name: 'Adnan Shahria', role: 'Founder & CEO', image: '' },
  { name: 'Lead Developer', role: 'Full Stack Engineer', image: '' },
  { name: 'AI Engineer', role: 'AI & Automation Lead', image: '' },
  { name: 'Design Lead', role: 'UI/UX Designer', image: '' },
];

export function LeadershipSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const rawMembers: any[] = t.leadership.members || [];
  const members = rawMembers.length > 0 ? rawMembers : FALLBACK_MEMBERS;
  const sortedMembers = [...members].sort(
    (a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)
  );

  const tagline = t.leadership.tagline;

  return (
    <section id="leadership" className="py-16 sm:py-20 px-3 sm:px-6 relative scroll-mt-12">

      <div className="w-full mx-auto relative" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl premium-card bg-white/[0.02] backdrop-blur-xl px-4 sm:px-14 py-4 sm:py-8 shadow-[0_0_40px_rgba(108,92,231,0.08)]">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="text-center mb-5 sm:mb-8"
          >
            <h2 className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-neon-emerald/25 bg-neon-emerald/5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">{t.leadership.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">{t.leadership.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {sortedMembers.map((member: any, i: number) => {
              const style = fallbackStyles[i % fallbackStyles.length];
              const hasImage = !!member.image;

              return (
                <div
                  key={i}
                  className="glass-effect bg-card/40 rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 text-center group transition-all duration-300 premium-card-sub sm:hover:-translate-y-1"
                >
                  {/* Circular photo or fallback icon */}
                  <motion.div
                    className="w-20 h-20 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full mx-auto mb-3 sm:mb-4 lg:mb-5 overflow-hidden flex items-center justify-center bg-secondary/30 border-2 sm:border-3 border-background shadow-xl relative"
                    style={
                      hasImage
                        ? { boxShadow: style.shadow }
                        : { background: style.gradient, boxShadow: style.shadow }
                    }
                    whileHover={{ scale: 1.08, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                  >
                    {hasImage ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" strokeWidth={1} />
                    )}
                    <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                  </motion.div>
                  <h3 className="font-display text-sm sm:text-xl lg:text-2xl font-bold text-foreground mb-0.5 sm:mb-1.5 leading-tight">{member.name}</h3>
                  <p className="text-neon-amber text-[10px] sm:text-sm lg:text-base font-bold tracking-wide uppercase">{member.role}</p>
                </div>
              );
            })}
          </div>

          {/* Optional Tagline Card below members */}
          {tagline && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: 'spring', stiffness: 60 }}
              className="mt-12 sm:mt-16 max-w-4xl mx-auto"
            >
              <div className="glass-effect rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-center bg-card/40 backdrop-blur-md transition-colors duration-500 premium-card">
                <p className="text-lg sm:text-2xl lg:text-3xl font-display font-medium text-foreground leading-relaxed italic relative z-10">
                  <span className="text-primary/40 text-4xl leading-none absolute -top-4 -left-2 sm:-left-6">"</span>
                  {tagline}
                  <span className="text-primary/40 text-4xl leading-none absolute -bottom-4 -right-2 sm:-right-6">"</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
