import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, X, ArrowRight, Star } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { Navbar } from '@/components/orbit/Navbar';
import { OrbitFooter } from '@/components/orbit/OrbitFooter';
import { Chatbot } from '@/components/orbit/Chatbot';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ensureAbsoluteUrl } from '@/lib/utils';
import DOMPurify from 'dompurify';

function ImageGallery({ images, title, onLightboxChange }: { images: string[]; title: string; onLightboxChange?: (open: boolean) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
    };

    const openLightbox = () => { setLightboxOpen(true); onLightboxChange?.(true); };
    const closeLightbox = () => { setLightboxOpen(false); onLightboxChange?.(false); };

    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const handleDragEnd = (e: any, { offset, velocity }: any) => {
        const swipe = swipePower(offset.x, velocity.x);

        if (swipe < -10000) {
            paginate(1);
        } else if (swipe > 10000) {
            paginate(-1);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            zIndex: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    return (
        <>
            {/* Main Carousel */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8"
            >
                <div className="relative w-full aspect-video bg-muted/10 rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_40px_rgba(108,92,231,0.1),0_8px_32px_rgba(0,0,0,0.4)] group">
                    {/* Main Image */}
                    <div className="absolute inset-0 cursor-pointer" onClick={openLightbox}>
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex]}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-0 w-full h-full object-contain bg-black/5 touch-pan-y"
                                alt={`${title} - slide ${currentIndex + 1}`}
                            />
                        </AnimatePresence>
                    </div>
                </div>

                {/* Premium Navigation & Dots Indicator */}
                {images.length > 1 && (
                    <div className="flex justify-center items-center gap-2 sm:gap-6 mt-8 relative z-10 px-4">
                        {/* Premium Backward Button */}
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                            whileHover={{ scale: 1.1, backgroundColor: '#16A34A' }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#22C55E] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[#22C55E]/50 transition-shadow shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>

                        <div className="flex justify-center flex-wrap gap-2 max-w-[60%] sm:max-w-none">
                            {images.map((_, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDirection(idx > currentIndex ? 1 : -1);
                                        setCurrentIndex(idx);
                                    }}
                                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 shrink-0 ${idx === currentIndex
                                        ? 'bg-[#FFD700] w-5 sm:w-6 shadow-[0_0_12px_rgba(255,215,0,0.8)]'
                                        : 'bg-white/20 hover:bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Premium Forward Button */}
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); paginate(1); }}
                            whileHover={{ scale: 1.1, backgroundColor: '#16A34A' }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#22C55E] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[#22C55E]/50 transition-shadow shrink-0"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {images.length > 1 && (
                            <>
                                <motion.button
                                    onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                    whileHover={{ scale: 1.1, backgroundColor: '#16A34A' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute left-4 md:left-8 z-20 p-4 rounded-full bg-[#22C55E] text-white transition-all hidden sm:flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </motion.button>
                                <motion.button
                                    onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                    whileHover={{ scale: 1.1, backgroundColor: '#16A34A' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute right-4 md:right-8 z-20 p-4 rounded-full bg-[#22C55E] text-white transition-all hidden sm:flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </motion.button>
                            </>
                        )}

                        <motion.img
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            src={images[currentIndex]}
                            alt="Fullscreen view"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={handleDragEnd}
                            className="max-w-full max-h-full md:max-w-[85vw] md:max-h-[85vh] object-contain select-none shadow-2xl touch-pan-y"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 group">
                            {/* Premium Golden Gradient Border Wrapper */}
                            <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-[#FFD700]/50 via-white/20 to-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                                <div className="flex items-center gap-4 text-white font-medium bg-[#0A0A0B]/90 px-4 py-2 rounded-full backdrop-blur-xl">
                                    {/* Mobile specific navigation inside indicator row */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                        className="flex sm:hidden p-2 -ml-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full transition-colors shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <span className="text-base min-w-[3.5rem] text-center tracking-wider tabular-nums font-semibold">
                                        {currentIndex + 1} <span className="text-[#FFD700] mx-0.5">/</span> {images.length}
                                    </span>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                        className="flex sm:hidden p-2 -mr-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full transition-colors shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function CollapsibleCards({ blocks }: { blocks: string[] }) {
    // First card expanded, rest collapsed by default
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (i: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {blocks.map((block: string, i: number) => {
                // Extract heading from block if present
                const headingMatch = block.match(/^<h3([^>]*)>(.*?)<\/h3>/i);
                const heading = headingMatch ? headingMatch[2].replace(/<[^>]*>/g, '').trim() : '';
                const headingColor = headingMatch ? (headingMatch[1].match(/data-color="([^"]*)"/i)?.[1] || '') : '';
                const bodyHtml = headingMatch ? block.replace(/^<h3[^>]*>.*?<\/h3>/i, '').trim() : block;
                const isExpanded = expanded.has(i);

                // For cards without heading, show a text preview
                const label = heading || `Section ${i + 1}`;
                const preview = !heading ? stripHtml(bodyHtml).slice(0, 60) : '';

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                        className="rounded-xl sm:rounded-2xl border border-[#2a2a3e] bg-[#0e0e18]/80 overflow-hidden"
                    >
                        {/* Clickable heading bar - Premium styling */}
                        <button
                            type="button"
                            onClick={() => toggle(i)}
                            className={`w-full flex items-center gap-4 px-6 sm:px-8 py-5 sm:py-6 text-left transition-all duration-500 relative group/toggle ${isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                                }`}
                        >
                            {/* Left accent border that glows when expanded */}
                            <div
                                className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 rounded-r-full ${isExpanded ? 'opacity-100 shadow-[2px_0_15px_rgba(108,92,231,0.4)]' : 'opacity-0'
                                    }`}
                                style={{ backgroundColor: headingColor || '#6c5ce7' }}
                            />

                            <div className="relative flex-shrink-0 group-hover/toggle:scale-105 transition-transform duration-500">
                                {/* Glowing outer ring - highly reduced */}
                                <div
                                    className={`absolute -inset-[1px] rounded-full opacity-30 blur-[1px] transition-all duration-500 ${isExpanded ? 'opacity-60' : 'group-hover/toggle:opacity-50'}`}
                                    style={{
                                        background: `linear-gradient(135deg, ${headingColor || '#6c5ce7'}20, transparent, ${headingColor || '#00f5ff'}20)`
                                    }}
                                />
                                {/* Main circle */}
                                <div
                                    className="relative flex items-center justify-center w-9 h-9 rounded-full border border-white/5 bg-[#0e0e18] shadow-inner"
                                >
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? '' : '-rotate-90'}`}
                                        style={{ color: headingColor || '#a29bfe', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 min-w-0">
                                <h3
                                    className={`text-lg sm:text-2xl font-bold tracking-tight transition-all duration-500`}
                                    style={{
                                        color: headingColor || 'inherit',
                                        textShadow: isExpanded && headingColor ? `0 0 8px ${headingColor}30` : undefined
                                    }}
                                >
                                    {label}
                                </h3>
                                {!isExpanded && preview && (
                                    <span className="text-sm text-muted-foreground/50 truncate font-medium tracking-wide">{preview}…</span>
                                )}
                            </div>
                        </button>
                        {/* Collapsible body */}
                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div
                                        className="px-5 sm:px-8 pb-5 sm:pb-7 pt-2 text-muted-foreground text-base sm:text-lg leading-relaxed space-y-4 [&_b]:font-bold [&_b]:text-foreground [&_i]:italic [&_span]:inline"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const { lang } = useLang();
    const { content } = useContent();
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Data with Fallback Logic
    const enData = (content.en as any).projects || {};
    const bnData = (content.bn as any).projects || {};
    const enItems: any[] = Array.isArray(enData.items) ? enData.items : [];
    const bnItems: any[] = Array.isArray(bnData.items) ? bnData.items : [];

    // Try slug-based lookup first, then fall back to numeric index
    let idx = -1;
    const slugIndex = enItems.findIndex((item: any) => item.id && item.id === id);
    if (slugIndex >= 0) {
        idx = slugIndex;
    } else {
        const numericIdx = parseInt(id || '-1', 10);
        if (!isNaN(numericIdx) && numericIdx >= 0 && numericIdx < enItems.length) {
            idx = numericIdx;
        }
    }

    // Get potential projects
    const projectEn = idx >= 0 ? enItems[idx] : undefined;
    const projectBn = idx >= 0 ? bnItems[idx] : undefined;

    // Determine fallback
    // If we are in BN mode, and BN project exists and has a title, use it. Otherwise use EN.
    const isBn = lang === 'bn';
    const hasBnContent = projectBn && projectBn.title && projectBn.title.trim() !== '';
    const project = (isBn && hasBnContent) ? projectBn : projectEn;

    if (!project || idx < 0) {
        return (
            <div className="min-h-[100dvh] bg-background text-foreground">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40 px-4">
                    <Helmet>
                        <title>Project Not Found | Orbit SaaS</title>
                        <meta name="robots" content="noindex" />
                    </Helmet>
                    <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
                    <Link to="/#projects" className="text-primary hover:underline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Projects
                    </Link>
                </div>
                <OrbitFooter />
            </div>
        );
    }

    // Build images array: prefer `images`, fallback to single `image`
    const allImages: string[] =
        project.images && Array.isArray(project.images) && project.images.length > 0
            ? project.images
            : project.image
                ? [project.image]
                : [];

    // SEO Data (Shared)
    // Note: SEO data on the item is shared so it should be available on both EN and BN objects
    const seoTitle = project.seo?.title || `${project.title} | Orbit SaaS Case Study`;
    const plainDesc = stripHtml(project.desc || '');
    const seoDesc = project.seo?.description || (plainDesc.length > 160 ? plainDesc.substring(0, 157) + '...' : plainDesc);
    const seoKeywords = project.seo?.keywords?.join(', ') || project.tags?.join(', ') || 'SaaS, Portfolio, Case Study';
    const ogImage = `https://orbitsaas.cloud/api/og?project=${encodeURIComponent(id || '')}`;
    const currentUrl = `https://orbitsaas.cloud/project/${id}`;



    return (
        <div className="min-h-[100dvh] relative bg-background text-foreground">
            {/* Neon Background Decorations */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.12),transparent_50%)] pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,245,255,0.08),transparent_50%)] pointer-events-none z-0" />
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/4 pointer-events-none z-0" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[130px] translate-y-1/4 -translate-x-1/4 pointer-events-none z-0" />
            <div className="fixed top-1/2 left-1/2 w-[400px] h-[400px] bg-neon-pink/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta name="keywords" content={seoKeywords} />
                <link rel="canonical" href={currentUrl} />

                {/* OpenGraph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:site_name" content="ORBIT SaaS" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDesc} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:image:alt" content={seoTitle} />
            </Helmet>
            {!lightboxOpen && <Navbar />}
            <main className="pt-20 relative z-10">
                {/* Image Gallery */}
                <ImageGallery images={allImages} title={project.title} onLightboxChange={setLightboxOpen} />

                {/* Two-Column Layout: Content + Sidebar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col lg:flex-row gap-10">
                    {/* Left: Main Content */}
                    <div className="flex-1 min-w-0">



                        {/* Project Title Card — Premium hero card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="rounded-2xl border border-[#2a2a3e] bg-[#0e0e18]/80 px-6 sm:px-10 py-8 sm:py-10 mb-6 relative overflow-hidden"
                        >
                            {/* Subtle gradient accent */}
                            <div className="absolute top-0 left-0 w-48 h-48 bg-[radial-gradient(circle,rgba(108,92,231,0.12),transparent_70%)] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(0,245,255,0.06),transparent_70%)] pointer-events-none" />

                            {/* Title — Centered */}
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 neon-text relative z-10 text-center">
                                {project.title}
                            </h1>

                            {/* Tags + Categories combined */}
                            <div className="flex flex-wrap justify-center gap-2 relative z-10">
                                {(project.categories || (project.category ? [project.category] : [])).map((cat: string, ci: number) => (
                                    <span
                                        key={`cat-${ci}`}
                                        className="px-3 py-1.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm font-bold uppercase tracking-wider border border-neon-cyan/20 shadow-[0_0_8px_rgba(0,245,255,0.1)]"
                                    >
                                        {cat}
                                    </span>
                                ))}
                                {project.tags && project.tags.map((tag: string, j: number) => (
                                    <span
                                        key={`tag-${j}`}
                                        className="px-3 py-1.5 rounded-full bg-neon-purple/10 text-neon-purple text-sm font-medium border border-neon-purple/15"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#6c5ce7]/20 to-transparent" />
                        </motion.div>

                        {/* Description — each paragraph section in its own collapsible card */}
                        {(() => {
                            const html = project.desc || '';
                            // Split by <hr> (admin separator), then further by <h3> headings
                            let blocks: string[] = [];
                            const hrParts = html.split(/<hr\s*\/?>/i).filter((b: string) => b.trim());
                            if (hrParts.length > 1) {
                                blocks = hrParts;
                            } else {
                                const h3Parts = html.split(/(?=<h3[^>]*>)/i).filter((b: string) => b.trim());
                                blocks = h3Parts.length > 0 ? h3Parts : [html];
                            }
                            const renderBlocks = blocks.filter((b: string) => b.trim());

                            return <CollapsibleCards blocks={renderBlocks} />;
                        })()}

                        {/* Live Link Button */}
                        {project.link && project.link !== '#' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-10"
                            >
                                <a
                                    href={ensureAbsoluteUrl(project.link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-purple/20 text-neon-purple font-medium border border-neon-purple/30 hover:bg-neon-purple/30 transition-all shadow-[0_0_20px_rgba(108,92,231,0.2)] hover:shadow-[0_0_30px_rgba(108,92,231,0.35)]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Visit Live Project
                                </a>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Suggested Projects Sidebar */}
                    {(() => {
                        const buildItem = (enItem: any, i: number) => {
                            const bnItem = bnItems[i];
                            const showBn = lang === 'bn' && bnItem && bnItem.title && bnItem.title.trim() !== '';
                            const displayItem = showBn ? bnItem : enItem;
                            return { ...displayItem, _id: enItem.id || '', _originalIndex: i };
                        };

                        let suggested = enItems
                            .map((enItem: any, i: number) => {
                                if (i === idx) return null;
                                return buildItem(enItem, i);
                            })
                            .filter(Boolean)
                            .slice(0, 8);

                        if (suggested.length === 0) return null;

                        return (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="w-full lg:w-[380px] flex-shrink-0"
                            >
                                <div className="lg:sticky lg:top-24">
                                    {/* Project Reviews — same card style as ReviewsSection */}
                                    {(() => {
                                        const reviewsData = (content.en as any).reviews;
                                        const reviewItems: any[] = reviewsData?.items || [];
                                        const projectSlug = projectEn?.id || String(idx);
                                        const projectReviews = reviewItems.filter((r: any) => r.projectId === projectSlug);
                                        if (projectReviews.length === 0) return null;
                                        return (
                                            <div className="mb-2">
                                                <h2 className="font-display text-lg font-bold text-foreground mb-4 neon-text">Reviews</h2>
                                                <div className="flex flex-col gap-3">
                                                    {projectReviews.map((review: any, ri: number) => (
                                                        <div key={ri} className="rounded-xl bg-white/[0.03] backdrop-blur-xl border border-[#2a2a3e] p-4 flex flex-col transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                                            {/* Top row: Stars + (no badge needed — we're already on the project page) */}
                                                            <div className="flex gap-0.5 mb-2.5">
                                                                {Array.from({ length: 5 }).map((_, si) => (
                                                                    <Star key={si} className={`w-3.5 h-3.5 ${si < (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                                                                ))}
                                                            </div>
                                                            <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-4">
                                                                "{review.text}"
                                                            </p>
                                                            <div className="pt-2.5 border-t border-white/[0.06]">
                                                                <span className="font-bold text-foreground text-xs block">{review.name}</span>
                                                                <span className="text-muted-foreground text-[11px]">{review.role}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <h2 className="font-display text-lg font-bold text-foreground mb-4 neon-text mt-8">More Projects</h2>
                                    <div className="flex flex-col gap-3">
                                        {suggested.map((item: any) => {
                                            const routeId = item._id || item._originalIndex;
                                            const coverImage = item.images?.[0] || item.image || '/placeholder.png';
                                            const itemCats: string[] = item.categories || (item.category ? [item.category] : []);

                                            return (
                                                <Link
                                                    key={routeId}
                                                    to={`/project/${routeId}`}
                                                    className="group flex gap-3 rounded-xl overflow-hidden border-2 border-neon-purple/20 hover:border-neon-purple/50 bg-white/[0.03] backdrop-blur-xl transition-[shadow,border-color] duration-300 hover:shadow-[0_0_20px_rgba(108,92,231,0.15)] p-2"
                                                >
                                                    <div className="relative w-36 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-muted">
                                                        <img
                                                            src={coverImage}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center py-0.5 min-w-0">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan neon-text-cyan mb-1 line-clamp-1">
                                                            {itemCats.slice(0, 2).join(' · ')}
                                                        </span>
                                                        <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </div>
            </main>
            <OrbitFooter />
            <Chatbot />
        </div>
    );
}
