import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * useCollisionSound — plays boom.mp3 on comet collision.
 *
 * Returns `playBoom()` function. Sound respects user's mute preference
 * stored in localStorage ('orbit_sound_muted').
 *
 * Also dispatches 'orbit-collision' events so the SoundToggle can
 * appear after 3 collisions.
 */
export function useCollisionSound() {
    const audioPoolRef = useRef<HTMLAudioElement[]>([]);
    const mutedRef = useRef(false);
    const poolIndexRef = useRef(0);

    // Load mute preference and pre-create audio pool
    useEffect(() => {
        mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';

        // Pre-create a small pool of Audio objects for overlapping playback
        const pool: HTMLAudioElement[] = [];
        for (let i = 0; i < 3; i++) {
            const audio = new Audio('/boom.mp3');
            audio.volume = 0.4;
            audio.preload = 'auto';
            pool.push(audio);
        }
        audioPoolRef.current = pool;
    }, []);

    // Listen for mute toggle events from other components
    useEffect(() => {
        const handler = () => {
            mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';
        };
        window.addEventListener('orbit-sound-toggle', handler);
        return () => window.removeEventListener('orbit-sound-toggle', handler);
    }, []);

    const playBoom = useCallback(() => {
        // Notify SoundToggle about the collision (always, even if muted)
        window.dispatchEvent(new Event('orbit-collision'));

        if (mutedRef.current) return;

        try {
            const pool = audioPoolRef.current;
            if (pool.length === 0) return;

            // Round-robin through the pool so overlapping collisions still play
            const audio = pool[poolIndexRef.current % pool.length];
            poolIndexRef.current++;

            audio.currentTime = 0;
            audio.volume = 0.35 + Math.random() * 0.15; // Slight variation
            audio.play().catch(() => { });
        } catch {
            // Silently fail
        }
    }, []);

    return { playBoom };
}

/**
 * SoundToggle — small floating mute/unmute button.
 * Only appears after 3 comet collisions have occurred.
 */
export function SoundToggle() {
    const [muted, setMuted] = useState(
        () => localStorage.getItem('orbit_sound_muted') === 'true'
    );
    const [visible, setVisible] = useState(false);
    const collisionCountRef = useRef(0);

    // Listen for collision events and show after 3
    useEffect(() => {
        const handler = () => {
            collisionCountRef.current++;
            if (collisionCountRef.current >= 3 && !visible) {
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

    if (!visible) return null;

    return (
        <button
            onClick={toggle}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="fixed bottom-[10dvh] left-4 z-[100] md:bottom-6 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 cursor-pointer sm:hidden animate-fadeIn"
            title={muted ? 'Sound OFF' : 'Sound ON'}
            style={{ animation: 'fadeIn 0.5s ease-out' }}
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
