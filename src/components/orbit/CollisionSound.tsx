import { useRef, useEffect, useCallback, useState } from 'react';
import { BOOM_DATA_URL } from './boomDataUrl';

/**
 * useCollisionSound — synthesized "dhurum" impact sound via Web Audio API.
 *
 * Returns `playBoom()` function. Sound respects user's mute preference
 * stored in localStorage ('orbit_sound_muted').
 * Sound only plays while the hero section is visible.
 *
 * AudioContext is lazily created and unlocked on first user interaction.
 */
export function useCollisionSound() {
    const audioPoolRef = useRef<HTMLAudioElement[]>([]);
    const mutedRef = useRef(false);
    const poolIndexRef = useRef(0);
    const volumeRef = useRef(0.50);

    // Load mute preference and pre-create audio pool
    useEffect(() => {
        // Explicitly check for 'true' string. If not 'true' (e.g. null on first visit), it stays false (unmuted)
        mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';

        // Read volume (0-100 scale), default to 50% if not set
        const savedVol = localStorage.getItem('orbit_sound_volume');
        const vol = savedVol !== null ? Number(savedVol) / 100 : 0.50;
        volumeRef.current = vol > 0 ? vol : 0.50; // Never default to 0

        // Pre-create a small pool of Audio objects using inline data URL (no HTTP request, no IDM trigger)
        const pool: HTMLAudioElement[] = [];
        for (let i = 0; i < 3; i++) {
            const audio = new Audio(BOOM_DATA_URL);
            audio.volume = volumeRef.current;
            pool.push(audio);
        }
        audioPoolRef.current = pool;

        // Unlock audio on first user gesture (mobile browsers block autoplay)
        const unlock = () => {
            pool.forEach(a => {
                a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => { });
            });
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('click', unlock, { once: true });

        return () => {
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('click', unlock);
        };
    }, []);

    // Listen for mute toggle events from other components
    useEffect(() => {
        const handler = () => {
            mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';
            const savedVol = localStorage.getItem('orbit_sound_volume');
            if (savedVol !== null) volumeRef.current = Number(savedVol) / 100;
        };
        window.addEventListener('orbit-sound-toggle', handler);
        return () => window.removeEventListener('orbit-sound-toggle', handler);
    }, []);

    const collisionCountRef = useRef(0);

    const playBoom = useCallback(() => {
        // Track collision count and notify SoundToggle (always, even when muted)
        collisionCountRef.current++;
        window.dispatchEvent(new CustomEvent('orbit-collision', { detail: collisionCountRef.current }));

        if (mutedRef.current) return;

        // Relaxed visibility check: continue playing if hero is still physically nearby
        const hero = document.getElementById('hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
            if (ratio >= 0.8) return; // user has scrolled mostly past hero
        }

        try {
            const pool = audioPoolRef.current;
            if (pool.length === 0) return;

            // Round-robin through the pool so overlapping collisions still play
            const audio = pool[poolIndexRef.current % pool.length];
            poolIndexRef.current++;

            audio.currentTime = 0;
            // Re-read volume from localStorage for real-time admin updates
            const savedVol = localStorage.getItem('orbit_sound_volume');
            // Boosted the base volume defaults slightly to ensure "dhurum" is heard
            const base = savedVol !== null ? Math.max(0.3, Number(savedVol) / 100) : Math.max(0.50, volumeRef.current);
            audio.volume = Math.max(0, Math.min(1, base * (0.85 + Math.random() * 0.3))); // ±15% variation

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((e) => console.log('Collision Audio blocked:', e));
            }
        } catch {
            // Silently fail
        }
    }, []);

    return { playBoom };
}

/**
 * SoundToggle — small floating mute/unmute button.
 * Shows a speaker icon on mobile (bottom-left corner).
 */
export function SoundToggle() {
    const [muted, setMuted] = useState(
        () => localStorage.getItem('orbit_sound_muted') === 'true'
    );
    const [visible, setVisible] = useState(false);

    // Show from the very first collision
    useEffect(() => {
        const handler = (e: Event) => {
            const count = (e as CustomEvent).detail;
            if (count >= 1 && !visible) {
                setVisible(true);
            }
        };
        window.addEventListener('orbit-collision', handler);
        return () => window.removeEventListener('orbit-collision', handler);
    }, [visible]);

    const toggle = () => {
        const next = !muted;
        setMuted(next);
        localStorage.setItem('orbit_sound_muted', String(next));
        window.dispatchEvent(new Event('orbit-sound-toggle'));
    };

    return (
        <button
            onClick={toggle}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="fixed bottom-[10dvh] left-4 z-[100] md:bottom-6 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-500 cursor-pointer sm:hidden"
            title={muted ? 'Sound OFF' : 'Sound ON'}
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transform: visible ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.5s ease, transform 0.4s ease',
            }}
        >
            {muted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="23" x2="17" y1="9" y2="15" />
                    <line x1="17" x2="23" y1="9" y2="15" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    );
}
