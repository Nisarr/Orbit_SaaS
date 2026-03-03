import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function truncate(str: string, max: number): string {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max).replace(/\s+\S*$/, '') + '...';
}

interface ProjectCardProps {
    item: any;
    routeId: string | number;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function ProjectCard({ item, routeId, isHovered, onMouseEnter, onMouseLeave }: ProjectCardProps) {
    const plainDesc = stripHtml(item.desc || '');
    const shortDesc = truncate(plainDesc, 100);
    const coverImage = item.images?.[0] || item.image || '/placeholder.png';
    const categories: string[] = item.categories || (item.category ? [item.category] : ['Portfolio']);

    // Build the list of hover images from admin-selected indices
    const hoverImageUrls: string[] = (() => {
        const indices: number[] = item.hoverImages || [];
        if (indices.length > 0) {
            return indices
                .filter((idx: number) => idx < (item.images?.length || 0))
                .map((idx: number) => item.images[idx]);
        }
        // Fallback: if no hover images selected, use the 2nd image if available
        return item.images?.[1] ? [item.images[1]] : [];
    })();

    // Cycling state
    const [activeIndex, setActiveIndex] = useState(-1); // -1 = cover image
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearCycling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isHovered && hoverImageUrls.length > 0 && typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
            // Start cycling immediately with first hover image
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveIndex(0);
                setTimeout(() => setIsTransitioning(false), 50);
            }, 50);

            // Then cycle every 2 seconds
            intervalRef.current = setInterval(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                    setActiveIndex(prev => {
                        const next = prev + 1;
                        return next >= hoverImageUrls.length ? 0 : next;
                    });
                    setTimeout(() => setIsTransitioning(false), 50);
                }, 300); // 300ms fade-out, then swap
            }, 2000);
        } else {
            clearCycling();
            if (!isHovered) {
                setIsTransitioning(true);
                setTimeout(() => {
                    setActiveIndex(-1);
                    setTimeout(() => setIsTransitioning(false), 50);
                }, 150);
            }
        }

        return clearCycling;
    }, [isHovered, hoverImageUrls.length, clearCycling]);

    const currentImage = activeIndex >= 0 && activeIndex < hoverImageUrls.length
        ? hoverImageUrls[activeIndex]
        : coverImage;

    return (
        <div
            className="group relative rounded-xl sm:rounded-2xl overflow-hidden flex flex-col h-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] transition-all duration-500 hover:border-neon-amber/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.08),0_0_60px_rgba(245,158,11,0.04)]"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Media Area */}
            <div className="relative aspect-video overflow-hidden bg-muted">
                <Link to={`/project/${routeId}`} className="block w-full h-full">
                    {/* Video Preview (on hover, desktop only) — only if no hover images */}
                    {item.videoPreview && hoverImageUrls.length === 0 && isHovered && typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? (
                        <video src={item.videoPreview} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-10" />
                    ) : null}

                    {/* Current Image with crossfade */}
                    <img
                        src={currentImage}
                        alt={item.title}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${isHovered ? 'scale-105 brightness-110' : ''
                            } ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100'}`}
                    />
                </Link>

                {/* Image indicator dots — shown on hover when multiple images */}
                {isHovered && hoverImageUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                        {hoverImageUrls.map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-300 ${i === activeIndex
                                        ? 'w-4 h-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                                        : 'w-1.5 h-1.5 bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Shimmer light sweep on hover */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </div>

                {/* Subtle amber tint on hover */}
                <div className="absolute inset-0 bg-neon-amber/0 group-hover:bg-neon-amber/[0.06] transition-colors duration-500 pointer-events-none z-10" />

                {/* Bottom gradient fade into content */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

                {/* Featured Badge */}
                {item.featured && (
                    <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-400/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-yellow-400/30">
                        ✦ Featured
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5 sm:p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <Link to={`/project/${routeId}`}>
                        <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-neon-amber transition-colors duration-300 leading-tight">
                            {item.title}
                        </h3>
                    </Link>
                </div>

                <p className="text-muted-foreground/80 text-[11px] sm:text-xs leading-relaxed mb-3 line-clamp-2 flex-grow">
                    {shortDesc}
                </p>

                {/* Footer: Category Tags & Premium Arrow */}
                <div className="pt-3 border-t border-white/[0.06] flex items-end justify-between gap-3 mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat: string, j: number) => (
                            <span
                                key={j}
                                className="px-2 py-[3px] rounded-md text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/50 bg-white/[0.04] border border-white/[0.06]"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>

                    {/* Premium Arrow Button */}
                    <Link
                        to={`/project/${routeId}`}
                        className="premium-arrow-btn shrink-0 relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 group/arrow"
                    >
                        {/* Outer ring */}
                        <span className="absolute inset-0 rounded-full border border-white/15 group-hover/arrow:border-neon-amber/50 transition-colors duration-300" />
                        {/* Glow background on hover */}
                        <span className="absolute inset-[2px] rounded-full bg-transparent group-hover/arrow:bg-neon-amber/15 transition-all duration-300" />
                        {/* Animated glow ring */}
                        <span className="absolute inset-[-3px] rounded-full border border-transparent group-hover/arrow:border-neon-amber/20 group-hover/arrow:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-500 scale-100 group-hover/arrow:scale-110 opacity-0 group-hover/arrow:opacity-100" />
                        {/* Icon */}
                        <ArrowUpRight className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40 group-hover/arrow:text-neon-amber transition-all duration-300 group-hover/arrow:-translate-y-[1px] group-hover/arrow:translate-x-[1px]" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export { stripHtml, truncate };
