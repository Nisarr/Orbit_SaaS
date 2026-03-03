import { useRef, useEffect, useCallback, useState } from 'react';
import { BOOM_DATA_URL } from './boomDataUrl';

/**
 * useCollisionSound — "dhurum" impact sound via Web Audio API.
 *
 * Returns `playBoom()` function. Sound respects user's mute preference
 * stored in localStorage ('orbit_sound_muted').
 * Sound only plays while the hero section is visible.
 *
 * Uses AudioContext + AudioBufferSourceNode (NOT HTMLAudioElement) for
 * reliable playback on mobile browsers. Mobile browsers block
 * HTMLAudioElement.play() outside user gestures, but Web Audio API only
 * needs AudioContext.resume() once during any user gesture.
 */

// ── Shared singleton so multiple hook instances reuse one context ──
let _audioCtx: AudioContext | null = null;
let _audioBuffer: AudioBuffer | null = null;
let _bufferLoading = false;
let _unlocked = false;

function getAudioCtx(): AudioContext {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
}

/** Decode the base64 data-URL into an AudioBuffer (once). */
async function ensureBuffer(): Promise<AudioBuffer | null> {
    if (_audioBuffer) return _audioBuffer;
    if (_bufferLoading) return null; // already in progress
    _bufferLoading = true;
    try {
        const ctx = getAudioCtx();
        // Strip the data-URL header to get raw base64
        const base64 = BOOM_DATA_URL.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        _audioBuffer = await ctx.decodeAudioData(bytes.buffer);
    } catch {
        _bufferLoading = false;
    }
    return _audioBuffer;
}

export function useCollisionSound() {
    const mutedRef = useRef(false);
    const volumeRef = useRef(0.50);

    // Load mute preference & decode audio buffer on mount
    useEffect(() => {
        mutedRef.current = localStorage.getItem('orbit_sound_muted') === 'true';

        const savedVol = localStorage.getItem('orbit_sound_volume');
        const vol = savedVol !== null ? Number(savedVol) / 100 : 0.50;
        volumeRef.current = vol > 0 ? vol : 0.50;

        // Start decoding in background (doesn't need user gesture)
        ensureBuffer();

        // Resume AudioContext on first user gesture (required on mobile)
        const unlock = () => {
            if (_unlocked) return;
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => { });
            }
            _unlocked = true;
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('click', unlock);
        };
        // If context is already running (desktop), mark unlocked
        if (_audioCtx && _audioCtx.state === 'running') _unlocked = true;

        window.addEventListener('touchstart', unlock, { once: true, passive: true });
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

    const playSound = useCallback(() => {
        try {
            if (!_audioBuffer || !_audioCtx) return;
            const ctx = _audioCtx;

            // Re-read volume from localStorage for real-time admin updates
            const savedVol = localStorage.getItem('orbit_sound_volume');
            const base = savedVol !== null ? Math.max(0.3, Number(savedVol) / 100) : Math.max(0.50, volumeRef.current);
            const finalVol = Math.max(0, Math.min(1, base * (0.85 + Math.random() * 0.3)));

            // Create a fresh source node (they are one-shot, this is by design)
            const source = ctx.createBufferSource();
            source.buffer = _audioBuffer;

            // Apply volume via GainNode
            const gain = ctx.createGain();
            gain.gain.value = finalVol;
            source.connect(gain);
            gain.connect(ctx.destination);

            source.start(0);
        } catch {
            // Silently fail
        }
    }, []);

    const playBoom = useCallback(() => {
        // Track collision count and notify SoundToggle (always, even when muted)
        collisionCountRef.current++;
        window.dispatchEvent(new CustomEvent('orbit-collision', { detail: collisionCountRef.current }));

        if (mutedRef.current) return;

        // Relaxed visibility check: only skip if hero is almost entirely scrolled away
        const hero = document.getElementById('hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
            if (ratio >= 0.95) return;
        }

        // If buffer isn't loaded yet, load it and play once ready
        if (!_audioBuffer) {
            ensureBuffer().then(() => {
                if (_audioBuffer && _audioCtx && _audioCtx.state === 'running') {
                    playSound();
                }
            });
            return;
        }

        const ctx = getAudioCtx();
        // If context is suspended, resume and play after it's running
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                playSound();
            }).catch(() => { });
            return;
        }

        playSound();
    }, [playSound]);

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
