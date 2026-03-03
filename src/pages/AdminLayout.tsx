import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import {
    LayoutDashboard, Type, ShoppingCart, Users, FolderOpen,
    MessageCircle, Globe, Shield, LogOut, Menu, X,
    Lightbulb, Phone, FileText, Cpu, CloudUpload, Loader2, Link as LinkIcon,
    Database, Mail, BarChart3, Star, Trash2, CheckCircle2, XCircle
} from 'lucide-react';

const navItems = [
    { label: 'Hero', path: '/admin/hero', icon: Type },
    { label: 'Stats', path: '/admin/stats', icon: BarChart3 },
    { label: 'Services', path: '/admin/services', icon: ShoppingCart },
    { label: 'Tech Stack', path: '/admin/tech-stack', icon: Cpu },
    { label: 'Why Us', path: '/admin/why-us', icon: Lightbulb },
    { label: 'Projects', path: '/admin/project', icon: FolderOpen },
    { label: 'Leadership', path: '/admin/leadership', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Contact', path: '/admin/contact', icon: Phone },
    { label: 'Footer', path: '/admin/footer', icon: FileText },
    { label: 'Legal Pages', path: '/admin/legal', icon: Shield },
    { label: 'Chatbot', path: '/admin/chatbot', icon: MessageCircle },
    { label: 'Links', path: '/admin/links', icon: LinkIcon },
    { label: 'Navbar', path: '/admin/navbar', icon: Globe },
    { label: 'SEO', path: '/admin/seo', icon: Shield },
    { label: 'Leads', path: '/admin/leads', icon: Mail },
    { label: 'Backup', path: '/admin/backup', icon: Database },
];

// Progress toast renderer
function ProgressToast({ progress, label, color }: { progress: number; label: string; color: string }) {
    const pct = Math.round(progress);
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground font-mono text-xs">{pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        boxShadow: `0 0 8px ${color}66`,
                    }}
                />
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Simulate progress: fast at first, slows toward 90%, stops there until done
    const startProgress = useCallback((toastId: string | number, label: string, color: string) => {
        let progress = 0;
        const update = () => {
            // Accelerate to ~85%, then crawl
            const remaining = 90 - progress;
            const increment = Math.max(0.3, remaining * 0.08);
            progress = Math.min(90, progress + increment);
            toast.custom(
                () => <ProgressToast progress={progress} label={label} color={color} />,
                { id: toastId, duration: Infinity }
            );
        };
        progressRef.current = setInterval(update, 200);
        // Initial render
        toast.custom(
            () => <ProgressToast progress={0} label={label} color={color} />,
            { id: toastId, duration: Infinity }
        );
        return toastId;
    }, []);

    const stopProgress = useCallback(() => {
        if (progressRef.current) {
            clearInterval(progressRef.current);
            progressRef.current = null;
        }
    }, []);

    const handlePublishCache = async () => {
        setPublishing(true);
        const toastId = toast.custom(() => null, { duration: Infinity });
        startProgress(toastId, 'Publishing cache...', '#10b981');
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_BASE}/api/cache`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            stopProgress();

            if (res.status === 401) {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Session expired. Please log in again.</span>
                        </div>
                    ),
                    { id: toastId, duration: 4000 }
                );
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error('Cache publish failed');

            // Complete to 100%
            toast.custom(
                () => <ProgressToast progress={100} label="Publishing cache..." color="#10b981" />,
                { id: toastId, duration: 600 }
            );

            const data = await res.json();
            const imgInfo = data.imagesWarmed != null ? ` · ${data.imagesWarmed}/${data.imagesFound} images warmed` : '';

            setTimeout(() => {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-foreground">
                                Cache published!{imgInfo} {data.cachedAt ? new Date(data.cachedAt).toLocaleTimeString() : ''}
                            </span>
                        </div>
                    ),
                    { id: toastId, duration: 5000 }
                );
            }, 700);
        } catch (err) {
            stopProgress();
            console.error(err);
            toast.custom(
                () => (
                    <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Failed to publish cache</span>
                    </div>
                ),
                { id: toastId, duration: 4000 }
            );
        } finally {
            setPublishing(false);
        }
    };

    const handleDeleteCache = async () => {
        if (!confirm('Are you sure you want to delete all cached content? The site will fall back to live DB queries until republished.')) return;
        setDeleting(true);
        const toastId = toast.custom(() => null, { duration: Infinity });
        startProgress(toastId, 'Deleting cache...', '#f59e0b');
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_BASE}/api/cache`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            stopProgress();

            if (res.status === 401) {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Session expired. Please log in again.</span>
                        </div>
                    ),
                    { id: toastId, duration: 4000 }
                );
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error('Cache delete failed');

            // Complete to 100%
            toast.custom(
                () => <ProgressToast progress={100} label="Deleting cache..." color="#f59e0b" />,
                { id: toastId, duration: 600 }
            );

            const data = await res.json();

            setTimeout(() => {
                toast.custom(
                    () => (
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-foreground">
                                Cache cleared! {data.clearedAt ? new Date(data.clearedAt).toLocaleTimeString() : ''}
                            </span>
                        </div>
                    ),
                    { id: toastId, duration: 5000 }
                );
            }, 700);
        } catch (err) {
            stopProgress();
            console.error(err);
            toast.custom(
                () => (
                    <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Failed to delete cache</span>
                    </div>
                ),
                { id: toastId, duration: 4000 }
            );
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/admin/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-[100dvh] bg-background flex">
            <Toaster position="top-right" theme="dark" richColors closeButton />
            <Helmet>
                <title>Admin Panel | Orbit SaaS</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-foreground">Admin Panel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-border space-y-1">
                    <button
                        onClick={handlePublishCache}
                        disabled={publishing}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors w-full cursor-pointer disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                        {publishing ? 'Publishing...' : 'Publish Cache'}
                    </button>
                    <button
                        onClick={handleDeleteCache}
                        disabled={deleting}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors w-full cursor-pointer disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {deleting ? 'Deleting...' : 'Delete Cache'}
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        View Site
                    </a>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-[100dvh]">
                {/* Top bar (mobile) */}
                <div className="lg:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="text-foreground cursor-pointer">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-display font-bold text-foreground text-sm">Admin Panel</span>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 sm:p-6 lg:p-8 max-w-4xl"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
