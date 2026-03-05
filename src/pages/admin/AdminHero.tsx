import { useState, useEffect } from 'react';
import { SectionHeader, LangToggle, SaveButton, TextField, ErrorAlert, useSectionEditor, JsonPanel, ColorField } from '@/components/admin/EditorComponents';

export default function AdminHero() {
    const { lang, setLang, saving, saved, error, getData, save } = useSectionEditor('hero');
    const [tagline, setTagline] = useState('');
    const [tagline2, setTagline2] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [cta, setCta] = useState('');
    const [learnMore, setLearnMore] = useState('');

    // Theme Customization
    const [taglineColor, setTaglineColor] = useState('');
    const [titleColor, setTitleColor] = useState('');
    const [ctaGradientStart, setCtaGradientStart] = useState('');
    const [ctaGradientEnd, setCtaGradientEnd] = useState('');

    useEffect(() => {
        const d = getData();
        if (d) {
            setTagline(d.tagline || '');
            setTagline2(d.tagline2 || '');
            setTitle(d.title || '');
            setSubtitle(d.subtitle || '');
            setCta(d.cta || '');
            setLearnMore(d.learnMore || '');

            // Defaults for colors
            setTaglineColor(d.taglineColor || '#00F5FF');
            setTitleColor(d.titleColor || '#FF00A8');
            setCtaGradientStart(d.ctaGradientStart || '#6c5ce7');
            setCtaGradientEnd(d.ctaGradientEnd || '#3b82f6');
        }
    }, [getData]);

    const currentPayload = {
        tagline, tagline2, title, subtitle, cta, learnMore,
        taglineColor, titleColor, ctaGradientStart, ctaGradientEnd
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionHeader title="Hero Section" description="Edit content and branding colors" />
                <LangToggle lang={lang} setLang={setLang} />
            </div>
            <ErrorAlert message={error} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Content */}
                <div className="space-y-4 bg-card rounded-xl p-4 md:p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        📝 Content
                    </h3>
                    <TextField label="Tagline (Row 1)" value={tagline} onChange={setTagline} lang={lang} />
                    <TextField label="Tagline (Row 2 — Mobile)" value={tagline2} onChange={setTagline2} lang={lang} />
                    <TextField label="Title" value={title} onChange={setTitle} lang={lang} />
                    <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline lang={lang} />
                    <p className="text-xs text-muted-foreground -mt-2 ml-1">💡 Select text → use toolbar: <code className="bg-muted px-1 rounded text-[11px]">B</code> bold, <code className="bg-muted px-1 rounded text-[11px]">Card</code> pill, <code className="bg-muted px-1 rounded text-[11px]">B+Green</code>, or <code className="bg-muted px-1 rounded text-[11px]">B+White</code></p>
                    <TextField label="CTA Button Text" value={cta} onChange={setCta} lang={lang} />
                    <TextField label="Learn More Button Text" value={learnMore} onChange={setLearnMore} lang={lang} />
                </div>

                {/* Colors */}
                <div className="space-y-6 bg-card rounded-xl p-4 md:p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        🎨 Theme Customization
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Tagline Accent" value={taglineColor} onChange={setTaglineColor} />
                            <ColorField label="Title Highlight" value={titleColor} onChange={setTitleColor} />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="text-sm font-bold text-foreground block mb-3 uppercase tracking-wider">CTA Button Gradient</label>
                            <div className="grid grid-cols-2 gap-4">
                                <ColorField label="Gradient Start" value={ctaGradientStart} onChange={setCtaGradientStart} />
                                <ColorField label="Gradient End" value={ctaGradientEnd} onChange={setCtaGradientEnd} />
                            </div>
                            <div
                                className="mt-4 h-12 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
                            >
                                Live Preview
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SaveButton onClick={() => save(currentPayload)} saving={saving} saved={saved} />

            <div className="mt-8 pt-8 border-t border-border">
                <JsonPanel
                    title={`JSON Import / Export (${lang.toUpperCase()})`}
                    data={currentPayload}
                    onImport={(parsed) => {
                        setTagline(parsed.tagline || '');
                        setTagline2(parsed.tagline2 || '');
                        setTitle(parsed.title || '');
                        setSubtitle(parsed.subtitle || '');
                        setCta(parsed.cta || '');
                        setLearnMore(parsed.learnMore || '');
                        setTaglineColor(parsed.taglineColor || '#00F5FF');
                        setTitleColor(parsed.titleColor || '#FF00A8');
                        setCtaGradientStart(parsed.ctaGradientStart || '#6c5ce7');
                        setCtaGradientEnd(parsed.ctaGradientEnd || '#3b82f6');
                    }}
                />
            </div>
        </div>
    );
}
