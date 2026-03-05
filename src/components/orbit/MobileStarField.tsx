import { useEffect, useRef, useCallback } from 'react';
import { useCollisionSound } from './CollisionSound';

/**
 * MobileStarField — "3D Deep Space Flight" background.
 *
 * PERFORMANCE-OPTIMIZED for low-end devices (html.low-perf):
 * ─ Stars: 5 mobile / 10 desktop (vs 20/40 normal).
 * ─ Shooting stars: enabled at ~5s intervals (vs ~2s normal).
 * ─ Icon comets: kept at 12s interval (vs 6s normal).
 * ─ Comet collisions: KEPT, at 14s intervals (vs 6s normal).
 * ─ Galaxy element & extra nebula layers: removed.
 * ─ Star rotation: slowed to 600s (vs 180s).
 * ─ Counter-rotation layer: removed (single layer only).
 *
 * General optimizations (all devices):
 * ─ No boxShadow on stars (avoids per-frame paint).
 * ─ Rotating containers shrunk from 180vw → 150vw (less GPU rasterization).
 * ─ Shooting stars use useRef + direct DOM manipulation (zero React re-renders).
 * ─ No mix-blend-mode on nebula layers (compositing overhead removed).
 * ─ nebulaBreath animates only opacity (compositor-only, no layout).
 * ─ willChange removed from individual stars (browser decides compositing).
 * ─ contain: layout style on rotating containers.
 */

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const isLowPerf = typeof document !== 'undefined' && document.documentElement.classList.contains('low-perf');

// Adaptive star count: reduced across the board, minimal on low-perf
const NUM_STARS = isLowPerf ? (isMobile ? 5 : 10) : (isMobile ? 20 : 40);

const generateStars = (count: number) => Array.from({ length: count }).map((_, i) => {
    const rawX = Math.random() * 100;
    const rawY = Math.random() * 100;
    const dx = rawX - 50;
    const dy = rawY - 50;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const travelDist = 60 + Math.random() * 80;
    const tx = (dx / dist) * travelDist;
    const ty = (dy / dist) * travelDist;
    const startX = 50 + dx * 0.2;
    const startY = 50 + dy * 0.2;

    return {
        id: i,
        x: startX,
        y: startY,
        tx: tx.toFixed(2),
        ty: ty.toFixed(2),
        size: 1 + Math.random() * 1.8, // Slightly larger to compensate for no boxShadow
        opacity: 0.4 + Math.random() * 0.6,
        color: Math.random() > 0.85 ? '#fbbf24' : Math.random() > 0.7 ? '#34d399' : '#ffffff',
        dur: 8 + Math.random() * 16,
        delay: Math.random() * -20,
        scale: 2 + Math.random() * 3.5,
    };
});

// Split into two sets for counter-rotating fields
const ZOOM_STARS_1 = generateStars(Math.ceil(NUM_STARS / 2));
const ZOOM_STARS_2 = generateStars(Math.floor(NUM_STARS / 2));

export function MobileStarField() {
    const rootRef = useRef<HTMLDivElement>(null);
    const shootingContainerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const isPausedRef = useRef(false);
    // Track last spawn side for alternating direction
    const lastStarSide = useRef<number>(0); // 0=top, 1=left, 2=right

    // Direct DOM shooting star spawner — zero React re-renders
    const spawnStar = useCallback(() => {
        const container = shootingContainerRef.current;
        if (!container) return;

        // Alternate sides: top(0) → left(1) → right(2) → top...
        const side = lastStarSide.current;
        lastStarSide.current = (side + 1) % 3;
        let left: string, top: string, angle: number;

        if (side === 0) {
            left = -10 + Math.random() * 120 + '%';
            top = '-10%';
            angle = 20 + Math.random() * 140;
        } else if (side === 1) {
            left = '-10%';
            top = -10 + Math.random() * 80 + '%';
            angle = -20 + Math.random() * 80;
        } else {
            left = '110%';
            top = -10 + Math.random() * 80 + '%';
            angle = 120 + Math.random() * 80;
        }

        const dur = 2.0 + Math.random() * 2.5;
        const travel = 100 + Math.random() * 100 + 'vw';
        const width = 60 + Math.random() * 100;
        const opacity = 0.5 + Math.random() * 0.5;

        const el = document.createElement('div');
        el.style.cssText = `
            position:absolute;
            left:${left};top:${top};
            width:${width}px;height:5px;border-radius:9999px;
            background:linear-gradient(to right, transparent 0%, rgba(16,185,129,0.3) 40%, rgba(255,255,255,${opacity}) 100%);
            --angle:${angle}deg;
            --travel:${travel};
            animation:shootingStarDynamic ${dur}s ease-in forwards;
            opacity:0;
        `;
        container.appendChild(el);

        // Auto-remove after animation ends
        setTimeout(() => {
            el.remove();
        }, dur * 1000 + 100);

        // Schedule the next shooting star
        const nextDelay = isLowPerf
            ? 6000 + Math.random() * 4000   // low-perf: ~8-10s between shots
            : isMobile
                ? 5000 + Math.random() * 5000  // mobile: ~7.5s avg
                : 5000 + Math.random() * 6000; // desktop: ~8s avg
        // (self-scheduling removed — driven by sequencer)
    }, []);

    // Service icon comet spawner — launches every 4s
    // Inline SVG paths for: Zap, Sparkles, Globe, Bot, Code, Database, Cpu, Smartphone
    const SERVICE_ICONS = [
        // Zap
        '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        // Sparkles
        '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        // Globe
        '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" stroke="currentColor" stroke-width="2" fill="none"/>',
        // Bot
        '<path d="M12 8V4H8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><rect width="16" height="12" x="4" y="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
        // Code
        '<polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        // Database
        '<ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 5V19A9 3 0 0 0 21 19V5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 12A9 3 0 0 0 21 12" stroke="currentColor" stroke-width="2" fill="none"/>',
        // Cpu
        '<rect width="16" height="16" x="4" y="4" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect width="6" height="6" x="9" y="9" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
        // Smartphone
        '<rect width="14" height="20" x="5" y="2" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 18h.01" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    ];
    const codeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const lastCometSide = useRef<boolean>(false); // false=left, true=right

    const spawnCodeComet = useCallback(() => {
        const container = shootingContainerRef.current;
        if (!container) return;

        const svgPath = SERVICE_ICONS[Math.floor(Math.random() * SERVICE_ICONS.length)];
        const top = 5 + Math.random() * 70 + '%';
        // Alternate sides: left ↔ right
        const fromLeft = !lastCometSide.current;
        lastCometSide.current = fromLeft;
        const left = fromLeft ? '-5%' : '105%';
        const angle = fromLeft ? (25 + Math.random() * 35) : (125 + Math.random() * 35);
        const dur = 4 + Math.random() * 3;
        const travel = (120 + Math.random() * 80) + 'vw';
        const colors = ['#10b981', '#14b8a6', '#f59e0b', '#34d399', '#a78bfa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 16 + Math.random() * 8;
        const spinDur = 1.5 + Math.random() * 2;
        const spinDir = Math.random() > 0.5 ? '360deg' : '-360deg';

        const el = document.createElement('div');
        el.style.cssText = `
            position:absolute;
            left:${left};top:${top};
            width:0;height:0;
            --angle:${angle}deg;
            --travel:${travel};
            animation:iconCometFly ${dur}s linear forwards;
            opacity:0;
            pointer-events:none;
        `;

        // Trailing glow line (anchored exactly behind 0,0)
        const trail = document.createElement('div');
        trail.style.cssText = `
            position:absolute;
            right:0;top:0;
            margin-top:-2.5px;
            width:100px;height:5px;border-radius:9999px;
            background:linear-gradient(to right, transparent, ${color}44, ${color}cc);
        `;

        // The SVG icon (centered exactly at 0,0)
        const iconEl = document.createElement('div');
        iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color};filter:drop-shadow(0 0 6px ${color}88) drop-shadow(0 0 12px ${color}44);">${svgPath}</svg>`;
        iconEl.style.cssText = `
            position:absolute;
            left:0;top:0;
            margin-left:-${size / 2}px;
            margin-top:-${size / 2}px;
            animation:spin ${spinDur}s linear infinite;
            line-height:0;
        `;
        iconEl.style.setProperty('--spin-to', spinDir);

        el.appendChild(trail);
        el.appendChild(iconEl);
        container.appendChild(el);

        setTimeout(() => { el.remove(); }, dur * 1000 + 100);
        // (self-scheduling removed — driven by sequencer)
    }, []);

    // ── Collision burst system ──
    const burstTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const ICON_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#34d399', '#a78bfa'];
    const { playBoom } = useCollisionSound();
    const playBoomRef = useRef(playBoom);
    playBoomRef.current = playBoom;

    const createBurst = (container: HTMLElement, cx: number, cy: number, particleColors: string[], flashColor: string, count: number, spread: number) => {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position:absolute;left:${cx}%;top:${cy}%;
            width:28px;height:28px;border-radius:50%;
            background:${flashColor};
            transform:translate(-50%,-50%);
            box-shadow:0 0 25px ${flashColor}, 0 0 50px ${flashColor}88, 0 0 80px ${flashColor}44;
            animation:burstFlash 0.6s ease-out forwards;
        `;
        container.appendChild(flash);
        setTimeout(() => flash.remove(), 700);
        for (let i = 0; i < count; i++) {
            const pAngle = (360 / count) * i + (Math.random() * 30 - 15);
            const pDist = spread * (0.6 + Math.random() * 0.8);
            const pRad = (pAngle * Math.PI) / 180;
            const px = Math.cos(pRad) * pDist;
            const py = Math.sin(pRad) * pDist;
            const pSize = 3 + Math.random() * 6;
            const pDur = 0.6 + Math.random() * 0.8;
            const pColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            const p = document.createElement('div');
            p.style.cssText = `
                position:absolute;left:${cx}%;top:${cy}%;
                width:${pSize}px;height:${pSize}px;border-radius:50%;
                background:${pColor};
                box-shadow:0 0 8px ${pColor}, 0 0 16px ${pColor}44;
                --px:${px}px;--py:${py}px;
                animation:burstParticle ${pDur}s ease-out forwards;
            `;
            container.appendChild(p);
            setTimeout(() => p.remove(), pDur * 1000 + 50);
        }
    };

    const createIncomingComet = (container: HTMLElement, fromX: number, fromY: number, toX: number, toY: number, color: string, dur: number, withIcon?: string) => {
        const dx = toX - fromX;
        const dy = toY - fromY;
        // Adjust angle for screen aspect ratio because dx is in vw and dy is in vh
        const pxDx = dx * window.innerWidth;
        const pxDy = dy * window.innerHeight;
        const angle = Math.atan2(pxDy, pxDx) * (180 / Math.PI);
        const comet = document.createElement('div');
        comet.style.cssText = `
            position:absolute;left:${fromX}%;top:${fromY}%;
            width:0;height:0;
            animation:cometApproach ${dur}s ease-in forwards;
            --toX:${dx}vw;--toY:${dy}vh;
            pointer-events:none;
        `;

        // Trail wrapper rotated to face target
        const trailLayer = document.createElement('div');
        trailLayer.style.cssText = `
            position:absolute;left:0;top:0;
            transform:rotate(${angle}deg);
        `;
        const trail = document.createElement('div');
        const tLen = withIcon ? 50 : 80;
        const tHeight = withIcon ? 4 : 5;
        trail.style.cssText = `
            position:absolute;
            right:0;top:0;
            margin-top:-${tHeight / 2}px;
            width:${tLen}px;height:${tHeight}px;border-radius:9999px;
            background:linear-gradient(to right, transparent, ${color}66, ${color});
        `;
        trailLayer.appendChild(trail);
        comet.appendChild(trailLayer);

        if (withIcon) {
            const iconHead = document.createElement('div');
            iconHead.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="color:${color};filter:drop-shadow(0 0 6px ${color});">${withIcon}</svg>`;
            iconHead.style.cssText = `
                position:absolute;left:0;top:0;
                margin-left:-9px;margin-top:-9px;
                animation:spin 2s linear infinite;
                line-height:0;
            `;
            iconHead.style.setProperty('--spin-to', '360deg');
            comet.appendChild(iconHead);
        } else {
            const head = document.createElement('div');
            head.style.cssText = `
                position:absolute;left:0;top:0;
                margin-left:-3px;margin-top:-3px;
                width:6px;height:6px;border-radius:50%;
                background:${color};box-shadow:0 0 8px ${color};
            `;
            comet.appendChild(head);
        }

        container.appendChild(comet);
        setTimeout(() => comet.remove(), dur * 1000 + 50);
    };

    // Helper: project from collision center outward along an angle until off-screen
    const projectOffScreen = (cx: number, cy: number, angleDeg: number): [number, number] => {
        const rad = (angleDeg * Math.PI) / 180;
        const cosA = Math.cos(rad);
        const sinA = Math.sin(rad);
        // March outward in small steps until we exit the 0–100 range on either axis
        let t = 1;
        while (t < 200) {
            const x = cx + cosA * t;
            const y = cy + sinA * t;
            if (x < -10 || x > 110 || y < -10 || y > 110) return [x, y];
            t += 2;
        }
        return [cx + cosA * 120, cy + sinA * 120]; // fallback: way off-screen
    };

    const spawnCollision = useCallback(() => {
        const container = shootingContainerRef.current;
        if (!container) return;
        // Collision center — random position across the viewport
        const cx = 10 + Math.random() * 80;
        const cy = 10 + Math.random() * 70;
        const isSpecialVsSpecial = Math.random() > 0.5;
        const approachDur = isMobile ? (1.4 + Math.random() * 0.5) : (1.2 + Math.random() * 0.6);

        // Pick two exactly opposite angles so comets fly head-to-head
        const a1 = Math.random() * 360;
        const a2 = a1 + 180;

        // Spawn both comets from OFF-SCREEN, flying inward to (cx, cy)
        const [from1X, from1Y] = projectOffScreen(cx, cy, a1);
        const [from2X, from2Y] = projectOffScreen(cx, cy, a2);

        // Signal other components (chatbot popup) to hide during collision
        const totalCollisionDur = (approachDur + 2) * 1000; // approach + burst + settle
        window.dispatchEvent(new CustomEvent('orbit-collision-start', { detail: { duration: totalCollisionDur } }));
        setTimeout(() => window.dispatchEvent(new Event('orbit-collision-end')), totalCollisionDur);

        if (isSpecialVsSpecial) {
            const color1 = ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)];
            const color2 = ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)];
            const icon1 = SERVICE_ICONS[Math.floor(Math.random() * SERVICE_ICONS.length)];
            const icon2 = SERVICE_ICONS[Math.floor(Math.random() * SERVICE_ICONS.length)];
            createIncomingComet(container, from1X, from1Y, cx, cy, color1, approachDur, icon1);
            createIncomingComet(container, from2X, from2Y, cx, cy, color2, approachDur, icon2);
            setTimeout(() => {
                const burstCount = isMobile ? 12 : 18;
                const burstSpread = isMobile ? 90 : 130;
                const fireColors = ['#ff6b00', '#ff4500', '#ff8c00', '#ffd700', '#ff3300', '#ffaa00', color1, color2];
                createBurst(container, cx, cy, fireColors, '#ff6b00', burstCount, burstSpread);
                playBoomRef.current();
                const flash = document.createElement('div');
                flash.className = 'collision-shake';
                flash.style.setProperty('--flash-color', `rgba(255, 107, 0, 0.20)`);
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 500);
                const emberCount = isMobile ? 4 : 6;
                for (let i = 0; i < emberCount; i++) {
                    const eAngle = Math.random() * 360;
                    const eDist = 30 + Math.random() * 60;
                    const eRad = (eAngle * Math.PI) / 180;
                    const ember = document.createElement('div');
                    ember.style.cssText = `
                        position:absolute;left:${cx}%;top:${cy}%;
                        width:${3 + Math.random() * 4}px;height:${8 + Math.random() * 12}px;
                        border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
                        background:linear-gradient(to top, #ff4500, #ffd700, transparent);
                        --px:${Math.cos(eRad) * eDist}px;--py:${Math.sin(eRad) * eDist - 20}px;
                        animation:burstParticle ${0.8 + Math.random() * 0.5}s ease-out forwards;
                        opacity:0.9;
                    `;
                    container.appendChild(ember);
                    setTimeout(() => ember.remove(), 1500);
                }
            }, approachDur * 1000);
        } else {
            const iconColor = ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)];
            const icon = SERVICE_ICONS[Math.floor(Math.random() * SERVICE_ICONS.length)];
            createIncomingComet(container, from1X, from1Y, cx, cy, '#ffffff', approachDur);
            createIncomingComet(container, from2X, from2Y, cx, cy, iconColor, approachDur, icon);
            setTimeout(() => {
                const burstCount = isMobile ? 9 : 14;
                const burstSpread = isMobile ? 70 : 100;
                createBurst(container, cx, cy, [iconColor, '#ffffff', iconColor + 'cc'], iconColor, burstCount, burstSpread);
                playBoomRef.current();
                const flash = document.createElement('div');
                flash.className = 'collision-shake';
                const r = parseInt(iconColor.slice(1, 3), 16);
                const g = parseInt(iconColor.slice(3, 5), 16);
                const b = parseInt(iconColor.slice(5, 7), 16);
                flash.style.setProperty('--flash-color', `rgba(${r}, ${g}, ${b}, 0.20)`);
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 500);
            }, approachDur * 1000);
        }
        // (self-scheduling removed — driven by sequencer)
    }, []);
    // ── Single sequencer: only one comet type on screen at a time ──
    // Pattern: star → pause → iconComet → pause → star → pause → collision → pause → repeat
    const sequencerRef = useRef<ReturnType<typeof setTimeout>>();
    const sequenceStep = useRef(0);

    const runSequence = useCallback(() => {
        const step = sequenceStep.current;
        // Gap between events (time AFTER the comet finishes before next one starts)
        const gap = isLowPerf ? 4000 : 3000;

        // Sequence: 0=star, 1=iconComet, 2=star, 3=collision
        if (step === 0 || step === 2) {
            // Shooting star — visible for ~3s
            spawnStar();
            sequenceStep.current = (step + 1) % 4;
            sequencerRef.current = setTimeout(runSequence, 3500 + gap);
        } else if (step === 1) {
            // Icon comet — visible for ~5s
            spawnCodeComet();
            sequenceStep.current = 2;
            sequencerRef.current = setTimeout(runSequence, 6000 + gap);
        } else {
            // Collision — approach ~1.5s + burst ~1.5s = ~3s
            spawnCollision();
            sequenceStep.current = 0;
            sequencerRef.current = setTimeout(runSequence, 4000 + gap);
        }
    }, [spawnStar, spawnCodeComet, spawnCollision]);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        // Start the sequencer after a short initial delay
        sequencerRef.current = setTimeout(runSequence, isLowPerf ? 2000 : 1000);
        return () => {
            if (sequencerRef.current) clearTimeout(sequencerRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (codeTimeoutRef.current) clearTimeout(codeTimeoutRef.current);
            if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
        };
    }, [runSequence]);

    // ── Pause/Resume: freeze animations when hero is not visible or tab is hidden ──
    const setPaused = useCallback((paused: boolean) => {
        if (paused === isPausedRef.current) return;
        isPausedRef.current = paused;
        const root = rootRef.current;
        if (!root) return;
        if (paused) {
            root.classList.add('starfield-paused');
            // Stop sequencer so no new shooting stars/collisions are spawned
            if (sequencerRef.current) { clearTimeout(sequencerRef.current); sequencerRef.current = undefined; }
        } else {
            root.classList.remove('starfield-paused');
            // Restart sequencer if it was stopped
            if (!sequencerRef.current) {
                sequencerRef.current = setTimeout(runSequence, 500);
            }
        }
    }, [runSequence]);

    // Intersection Observer: pause when hero section is not visible
    useEffect(() => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Don't resume if tab is hidden
                if (document.hidden) return;
                setPaused(!entry.isIntersecting);
            },
            { threshold: 0.05 } // trigger when even 5% of hero is visible
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, [setPaused]);

    // Page Visibility: pause when tab is hidden (user switches apps)
    useEffect(() => {
        const onVisChange = () => {
            if (document.hidden) {
                setPaused(true);
            } else {
                // Only resume if hero is actually visible
                const hero = document.getElementById('hero');
                if (hero) {
                    const rect = hero.getBoundingClientRect();
                    const heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;
                    setPaused(!heroVisible);
                }
            }
        };
        document.addEventListener('visibilitychange', onVisChange);
        return () => document.removeEventListener('visibilitychange', onVisChange);
    }, [setPaused]);

    return (
        <div
            ref={rootRef}
            className="fixed inset-0 w-full h-[100dvh] pointer-events-none select-none"
            style={{ zIndex: -49, contain: 'layout style' }}
            aria-hidden
        >
            {/* ── 1. Deep Cosmic Void Base ── */}
            <div className="absolute inset-0 bg-[#000000]" />

            {/* ── 2. Rich Deep Galaxy Dust & Nebulas (no mix-blend-mode) ── */}
            {/* Neon Green / Emerald Cloud */}
            <div className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.08) 0%, rgba(4, 47, 46, 0.03) 50%, transparent 100%)',
                    animation: isLowPerf ? 'none' : 'nebulaBreath 15s ease-in-out infinite alternate',
                    opacity: isLowPerf ? 0.7 : undefined,
                    ['--neb-lo' as any]: '0.5',
                    ['--neb-hi' as any]: '1'
                }}
            />
            {/* Orange-Gold / Amber Cloud — skip on low-perf */}
            {!isLowPerf && (
                <div className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at 80% 30%, rgba(245, 158, 11, 0.06) 0%, rgba(120, 53, 15, 0.02) 60%, transparent 100%)',
                        animation: 'nebulaBreath 12s ease-in-out 3s infinite alternate',
                        ['--neb-lo' as any]: '0.4',
                        ['--neb-hi' as any]: '0.9'
                    }}
                />
            )}
            {/* Ambient Cosmic Dust Diagonal (static, no animation) */}
            <div className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 40%, rgba(245, 158, 11, 0.03) 100%)'
                }}
            />

            {/* ── 3. Distant Spiral Galaxy Element — skip on low-perf ── */}
            {!isLowPerf && (
                <div className="absolute top-[35%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] sm:w-[90vw] sm:h-[90vw] opacity-50">
                    {/* Galactic Core Glow */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(245,158,11,0.08) 10%, rgba(217,119,6,0.03) 30%, transparent 50%)',
                            animation: 'nebulaBreath 10s ease-in-out infinite alternate',
                            ['--neb-lo' as any]: '0.6',
                            ['--neb-hi' as any]: '1'
                        }}
                    />
                    {/* Spiral Disk Body */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, rgba(20,184,166,0.03) 40%, transparent 60%)',
                            transform: 'scaleY(0.3) rotate(15deg)',
                            animation: 'nebulaBreath 18s ease-in-out 2s infinite alternate',
                            ['--neb-lo' as any]: '0.5',
                            ['--neb-hi' as any]: '0.9'
                        }}
                    />
                    {/* Second Spiral Arm */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.02) 30%, transparent 50%)',
                            transform: 'scaleY(0.25) rotate(-20deg)',
                            animation: 'nebulaBreath 14s ease-in-out 5s infinite alternate',
                            ['--neb-lo' as any]: '0.4',
                            ['--neb-hi' as any]: '0.8'
                        }}
                    />
                </div>
            )}

            {/* ── 4. Floating 3D Zooming Stars ── */}
            {/* Layer 1: Forward Rotation (150vw container, down from 180vw) */}
            <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] star-layer-rotate"
                style={{
                    animation: `starFieldRotate ${isLowPerf ? '600s' : '180s'} linear infinite`,
                    contain: 'layout style',
                }}
            >
                {ZOOM_STARS_1.map((s) => (
                    <div
                        key={`z1-${s.id}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${s.x}%`, top: `${s.y}%`,
                            width: `${s.size}px`, height: `${s.size}px`,
                            background: s.color,
                            ['--star-op' as any]: s.opacity,
                            ['--tx' as any]: s.tx,
                            ['--ty' as any]: s.ty,
                            ['--star-scale' as any]: s.scale,
                            animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                            opacity: 0,
                        }}
                    />
                ))}
            </div>

            {/* Layer 2: Counter-Rotation — skip on low-perf (single layer is enough) */}
            {!isLowPerf && (
                <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] star-layer-rotate-reverse"
                    style={{
                        animation: 'starFieldRotateReverse 240s linear infinite',
                        contain: 'layout style',
                    }}
                >
                    {ZOOM_STARS_2.map((s) => (
                        <div
                            key={`z2-${s.id}`}
                            className="absolute rounded-full"
                            style={{
                                left: `${s.x}%`, top: `${s.y}%`,
                                width: `${s.size}px`, height: `${s.size}px`,
                                background: s.color,
                                ['--star-op' as any]: s.opacity,
                                ['--tx' as any]: s.tx,
                                ['--ty' as any]: s.ty,
                                ['--star-scale' as any]: s.scale,
                                animation: `starZoom ${s.dur}s ease-in ${s.delay}s infinite`,
                                opacity: 0,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── 5. Dynamic Shooting Stars (DOM-direct, zero re-renders) ── */}
            <div ref={shootingContainerRef} className="absolute inset-0 starfield-shooting" />
        </div>
    );
}
