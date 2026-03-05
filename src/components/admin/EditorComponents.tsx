import { useState, useEffect, useCallback, useRef } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { toast } from 'sonner';
import {
    Save, Check, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp,
    ChevronsUpDown, Sparkles, Loader2, ArrowUp, ArrowDown,
    Braces, Copy, ClipboardPaste
} from 'lucide-react';

/* ─── Language Toggle ─── */
export function LangToggle({ lang, setLang }: { lang: string; setLang: (l: string) => void }) {
    return (
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {['en', 'bn'].map(l => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {l === 'en' ? 'English' : 'বাংলা'}
                </button>
            ))}
        </div>
    );
}

/* ─── Save Button ─── */
export function SaveButton({ onClick, saving, saved, className = '' }: { onClick: () => void; saving: boolean; saved: boolean; className?: string }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${className} ${saved
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-primary text-primary-foreground hover:opacity-90'
                } disabled:opacity-50`}
        >
            {saving ? (
                <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                </>
            ) : saved ? (
                <>
                    <Check className="w-4 h-4" /> Saved!
                </>
            ) : (
                <>
                    <Save className="w-4 h-4" /> Save Changes
                </>
            )}
        </button>
    );
}

/* ─── Inline JSON Panel ─── */
export function JsonPanel({
    data,
    onImport,
    title = "JSON Import / Export",
    description = "Export current form data as JSON or paste JSON below to import.",
}: {
    data: any;
    onImport: (parsed: any) => void;
    title?: string;
    description?: string;
}) {
    const [open, setOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const [parseError, setParseError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleExport = () => {
        const json = JSON.stringify(data, null, 2);
        setJsonText(json);
        setParseError('');
    };

    const handleCopy = async () => {
        try {
            const json = jsonText || JSON.stringify(data, null, 2);
            await navigator.clipboard.writeText(json);
            setCopied(true);
            toast.success('JSON copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    const handleImport = () => {
        setParseError('');
        try {
            const parsed = JSON.parse(jsonText);
            onImport(parsed);
            toast.success('JSON imported into form! Click "Save Changes" to persist.');
        } catch (err: any) {
            setParseError(`Invalid JSON: ${err.message}`);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
                onClick={() => { setOpen(!open); if (!open) handleExport(); }}
                className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    <Braces className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Power Tool</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {open && (
                <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                        {description} <b>Importing fills the form</b> — you still need to click <b>"Save Changes"</b> to persist.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                            <Braces className="w-3.5 h-3.5" /> Export Current
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!jsonText.trim()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
                        >
                            <ClipboardPaste className="w-3.5 h-3.5" /> Import into Form
                        </button>
                    </div>

                    {parseError && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{parseError}</span>
                        </div>
                    )}

                    <textarea
                        value={jsonText}
                        onChange={(e) => { setJsonText(e.target.value); setParseError(''); }}
                        placeholder='Paste your JSON here...'
                        rows={16}
                        className="w-full rounded-lg bg-background border border-border p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                        spellCheck={false}
                    />
                </div>
            )}
        </div>
    );
}

/* ─── AI Enhance Button ─── */
export function AIEnhanceButton({
    text,
    lang,
    onEnhanced,
}: {
    text: string;
    lang: string;
    onEnhanced: (enhanced: string) => void;
}) {
    const [loading, setLoading] = useState(false);

    const handleEnhance = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);
        const toastId = toast.loading('Enhancing with AI...');

        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_BASE}/api/ai?action=enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text, lang }),
            });

            if (!response.ok) throw new Error('Failed to enhance');
            const data = await response.json();
            if (data.enhancedText) {
                onEnhanced(data.enhancedText);
                toast.success('Content enhanced!', { id: toastId });
            }
        } catch (err) {
            console.error('AI Enhance error:', err);
            toast.error('AI enhancement failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleEnhance}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 disabled:opacity-50 transition-colors cursor-pointer"
            title="Enhance with AI"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Enhance
        </button>
    );
}

/** Parse rich markers into segments for preview rendering */
function parseRichSegments(str: string): { text: string; bold: boolean; card: boolean; whiteCard: boolean }[] {
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
    return parts;
}

/* ─── Text Field ─── */
export function TextField({
    label,
    value,
    onChange,
    multiline = false,
    lang,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    lang?: string;
}) {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const [selToolbar, setSelToolbar] = useState<{ top: number; left: number; start: number; end: number } | null>(null);

    // Check selection on mouse-up and key-up
    const checkSelection = useCallback(() => {
        const ta = taRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        if (start === end || start === undefined) { setSelToolbar(null); return; }

        const rect = ta.getBoundingClientRect();
        setSelToolbar({ top: rect.top - 44, left: rect.left + rect.width / 2, start, end });
    }, []);

    // Read directly from DOM to avoid stale closures
    const wrapSelection = useCallback((prefix: string, suffix: string) => {
        const ta = taRef.current;
        if (!selToolbar || !ta) return;
        const { start, end } = selToolbar;
        const currentValue = ta.value; // Always fresh from DOM
        const before = currentValue.substring(0, start);
        const selected = currentValue.substring(start, end);
        const after = currentValue.substring(end);
        // Toggle: if already wrapped with this exact marker, unwrap
        if (before.endsWith(prefix) && after.startsWith(suffix)) {
            onChange(before.slice(0, -prefix.length) + selected + after.slice(suffix.length));
        } else {
            onChange(before + prefix + selected + suffix + after);
        }
        setSelToolbar(null);
    }, [selToolbar, onChange]);

    // Check if value has any rich markers for preview
    const hasRichMarkers = multiline && (/\*\*/.test(value) || /\[\[/.test(value) || /\{\{/.test(value));

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground block">{label}</label>
                {lang && (
                    <AIEnhanceButton
                        text={value}
                        lang={lang}
                        onEnhanced={onChange}
                    />
                )}
            </div>
            {multiline ? (
                <div className="relative">
                    <textarea
                        ref={taRef}
                        value={value}
                        onChange={e => { onChange(e.target.value); setSelToolbar(null); }}
                        onMouseUp={checkSelection}
                        onKeyUp={checkSelection}
                        onBlur={() => setTimeout(() => setSelToolbar(null), 250)}
                        rows={3}
                        className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 border border-border resize-y"
                    />
                    {/* Floating Selection Toolbar */}
                    {selToolbar && (
                        <div
                            className="fixed z-[9999] flex items-center gap-1 px-1.5 py-1 bg-[#1a1a2e] border border-primary/40 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
                            style={{ top: selToolbar.top, left: selToolbar.left, transform: 'translateX(-50%)' }}
                            onMouseDown={e => e.preventDefault()}
                        >
                            {/* Bold Only */}
                            <button
                                type="button"
                                onMouseDown={e => { e.preventDefault(); wrapSelection('**', '**'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Bold Only"
                            >
                                <span className="text-sm font-black">B</span>
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            {/* Card Only */}
                            <button
                                type="button"
                                onMouseDown={e => { e.preventDefault(); wrapSelection('[[', ']]'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="Card Only"
                            >
                                <span className="px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold">Card</span>
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            {/* Bold + Green Card */}
                            <button
                                type="button"
                                onMouseDown={e => { e.preventDefault(); wrapSelection('**[[', ']]**'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                title="Bold + Green Card"
                            >
                                <span className="text-sm font-black">B</span>
                                <span className="text-[9px]">+</span>
                                <span className="px-1 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/20 text-[10px] font-bold text-emerald-400">Green</span>
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            {/* Bold + White Card */}
                            <button
                                type="button"
                                onMouseDown={e => { e.preventDefault(); wrapSelection('**{{', '}}**'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Bold + White Card"
                            >
                                <span className="text-sm font-black">B</span>
                                <span className="text-[9px]">+</span>
                                <span className="px-1 py-0.5 rounded border border-white/30 bg-white/20 text-[10px] font-bold text-white">White</span>
                            </button>
                        </div>
                    )}
                    {/* Live Preview */}
                    {hasRichMarkers && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50 text-sm text-muted-foreground leading-relaxed flex flex-wrap gap-x-[0.3em]">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold w-full mb-1">Preview</span>
                            {parseRichSegments(value).map((seg, i) => {
                                if (!seg.bold && !seg.card && !seg.whiteCard) return <span key={i}>{seg.text}</span>;
                                const classes = [
                                    seg.bold ? 'font-bold text-foreground' : '',
                                    seg.card ? 'word-card' : '',
                                    seg.whiteCard ? 'word-card-white' : '',
                                ].filter(Boolean).join(' ');
                                return <span key={i} className={classes}>{seg.text}</span>;
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 border border-border"
                />
            )}
        </div>
    );
}

/* ─── Color Field ─── */
export function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border">
                <div
                    className="w-6 h-6 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-foreground outline-none"
                    placeholder="#RRGGBB"
                />
                <input
                    type="color"
                    value={value.startsWith('#') && value.length === 7 ? value : '#6c5ce7'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-0 h-0 opacity-0 absolute pointer-events-none"
                    id={`color-${label.replace(/\s+/g, '-').toLowerCase()}`}
                />
                <label
                    htmlFor={`color-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    className="cursor-pointer text-xs font-bold text-primary hover:text-primary/80"
                >
                    Pick
                </label>
            </div>
        </div>
    );
}

/* ─── Section Header ─── */
export function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-4 md:mb-6">
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">{description}</p>
        </div>
    );
}

/* ─── Error Alert ─── */
export function ErrorAlert({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message}
        </div>
    );
}

/* ─── Item List Editor (for arrays of items) with Expand / Collapse ─── */
export function ItemListEditor<T extends Record<string, unknown>>({
    items,
    setItems,
    renderItem,
    newItem,
    addLabel = 'Add Item',
    getItemLabel,
    onSave,
}: {
    items: T[];
    setItems: (items: T[]) => void;
    renderItem: (item: T, index: number, update: (updated: T) => void) => React.ReactNode;
    newItem: T;
    addLabel?: string;
    getItemLabel?: (item: T, index: number) => string;
    onSave?: () => void;
}) {
    // Track which items are expanded (by index) — start all collapsed
    const [expanded, setExpanded] = useState<Set<number>>(new Set());


    const toggleItem = (index: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const allExpanded = items.length > 0 && expanded.size === items.length;

    const toggleAll = () => {
        if (allExpanded) {
            setExpanded(new Set());
        } else {
            setExpanded(new Set(items.map((_, i) => i)));
        }
    };

    const updateItem = (index: number, updated: T) => {
        const copy = [...items];
        copy[index] = updated;
        setItems(copy);
    };

    const removeItem = (index: number) => {
        setExpanded(prev => {
            const next = new Set<number>();
            prev.forEach(idx => {
                if (idx < index) next.add(idx);
                else if (idx > index) next.add(idx - 1);
            });
            return next;
        });
        setItems(items.filter((_, i) => i !== index));
    };

    const addItem = () => {
        const newIndex = items.length;
        setItems([...items, { ...newItem }]);
        setExpanded(prev => new Set(prev).add(newIndex));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;
        const copy = [...items];
        [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
        // Update expanded state to follow moved items
        setExpanded(prev => {
            const next = new Set<number>();
            prev.forEach(idx => {
                if (idx === index) next.add(newIndex);
                else if (idx === newIndex) next.add(index);
                else next.add(idx);
            });
            return next;
        });
        setItems(copy);
    };

    const defaultLabel = (item: T, i: number): string => {
        // Try common title fields
        const title = item.title || item.name || item.label;
        if (typeof title === 'string' && title.trim()) return title.trim();
        return `Item ${i + 1}`;
    };

    const getLabel = getItemLabel || defaultLabel;

    return (
        <div className="space-y-3">
            {/* Expand / Collapse All toggle */}
            {items.length > 1 && (
                <div className="flex justify-end">
                    <button
                        onClick={toggleAll}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-secondary"
                    >
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            )}

            {items.map((item, i) => {
                const isExpanded = expanded.has(i);
                const label = getLabel(item, i);

                return (
                    <div key={i} className="flex gap-3 items-start">
                        <div className="flex flex-col gap-0.5 mt-2">
                            <button
                                onClick={() => moveItem(i, 'up')}
                                disabled={i === 0}
                                className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Move up"
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => moveItem(i, 'down')}
                                disabled={i === items.length - 1}
                                className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Move down"
                            >
                                <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex-1 bg-secondary/50 rounded-xl border border-border overflow-hidden">
                            {/* Collapsible Header */}
                            <button
                                onClick={() => toggleItem(i)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-secondary/80 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {label}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Collapsible Content */}
                            <div
                                className="grid transition-all duration-250 ease-in-out"
                                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50">
                                        {renderItem(item, i, (updated) => updateItem(i, updated))}
                                        {onSave && isExpanded && (
                                            <div className="flex justify-end pt-2 border-t border-border/30 mt-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer"
                                                >
                                                    <Save className="w-3.5 h-3.5" /> Save Item Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => removeItem(i)}
                            className="mt-3 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
            <button
                onClick={addItem}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                {addLabel}
            </button>
        </div>
    );
}

// ... (removed)

/* ─── useSectionEditor hook ─── */
export function useSectionEditor(sectionName: string) {
    const { content, updateSection } = useContent();
    const [lang, setLang] = useState('en');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const getData = useCallback(() => {
        return (content[lang as 'en' | 'bn'] as Record<string, unknown>)?.[sectionName] as any;
    }, [content, lang, sectionName]);

    const save = useCallback(async (data: unknown) => {
        console.log(`[Admin] Saving section: ${sectionName} (${lang})`, data);
        setSaving(true);
        setSaved(false);
        setError('');
        const toastId = toast.loading('Saving changes...');

        try {
            const ok = await updateSection(sectionName, lang, data);
            if (ok) {
                console.log(`[Admin] Save successful: ${sectionName}`);
                setSaved(true);
                toast.success('Changes saved successfully', { id: toastId });
                // Trigger collapse for all ItemListEditors
                window.dispatchEvent(new CustomEvent('orbit:save-success', { detail: { section: sectionName } }));
                setTimeout(() => setSaved(false), 2000);
            } else {
                console.error(`[Admin] Save failed (Server rejection): ${sectionName}`);
                setError('Failed to save. Please try again.');
                toast.error('Failed to save changes', { id: toastId });
            }
        } catch (err) {
            console.error(`[Admin] Save error:`, err);
            setError('Server error. Please try again.');
            toast.error('Server error occurred', { id: toastId });
        } finally {
            setSaving(false);
        }
    }, [updateSection, sectionName, lang]);

    return { lang, setLang, saving, saved, error, getData, save };
}
