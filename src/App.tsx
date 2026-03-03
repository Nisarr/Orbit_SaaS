import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ContentProvider } from './contexts/ContentContext';
import { Navbar } from './components/orbit/Navbar';
import { Home } from './components/orbit/Home';
import { StatsSection } from './components/orbit/StatsSection';
import { ServicesSection } from './components/orbit/ServicesSection';
import { TechStackSection } from './components/orbit/TechStackSection';
import { WhyUsSection } from './components/orbit/WhyUsSection';
import { ProjectsSection } from './components/orbit/ProjectsSection';
import { LeadershipSection } from './components/orbit/LeadershipSection';
import { ReviewsSection } from './components/orbit/ReviewsSection';
import { ContactSection } from './components/orbit/ContactSection';
import { OrbitFooter } from './components/orbit/OrbitFooter';
// Chatbot is lazy-loaded below for performance
import { StructuredData } from './components/seo/StructuredData';
// LeadMagnetPopup is lazy-loaded below — only triggers after 15s or exit-intent
import ScrollToTop from './components/ScrollToTop';

import { lazy, Suspense, useEffect, useState } from 'react';

// Lazy load admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminHero = lazy(() => import('./pages/admin/AdminHero'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminTechStack = lazy(() => import('./pages/admin/AdminTechStack'));
const AdminWhyUs = lazy(() => import('./pages/admin/AdminWhyUs'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminLeadership = lazy(() => import('./pages/admin/AdminLeadership'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));
const AdminChatbot = lazy(() => import('./pages/admin/AdminChatbot'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminLinks = lazy(() => import('./pages/admin/AdminLinks'));
const AdminNavbar = lazy(() => import('./pages/admin/AdminNavbar'));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'));
const AdminBackup = lazy(() => import('./pages/admin/AdminBackup'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminLegal = lazy(() => import('./pages/admin/AdminLegal'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Chatbot = lazy(() => import('./components/orbit/Chatbot').then(m => ({ default: m.Chatbot })));
const LeadMagnetPopup = lazy(() => import('./components/orbit/LeadMagnetPopup').then(m => ({ default: m.LeadMagnetPopup })));
import { GlobalBackground } from './components/orbit/GlobalBackground';

// Low-end device detection — applies .low-perf class to <html>
function detectLowEndDevice() {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  const isMobile = window.innerWidth < 768;
  const isLowEnd = cores <= 4 || memory <= 4 || isMobile;
  if (isLowEnd) {
    document.documentElement.classList.add('low-perf');
  }
  return isLowEnd;
}

function PublicSite() {
  const [showChatbot, setShowChatbot] = useState(false);
  // Tracks whether the dice loader has finished (3.2s)
  const [isLoaded, setIsLoaded] = useState(false);

  // Formulate and record unique visitor session
  useEffect(() => {
    let sessionId = localStorage.getItem('orbit_visitor_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('orbit_visitor_session_id', sessionId);
    }

    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/record-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    }).catch(err => console.error("Visitor logging failed", err));
  }, []);

  // Low-end device detection on mount
  useEffect(() => {
    detectLowEndDevice();
  }, []);

  // After dice loader finishes (3.2s), mount the rest of the sections
  useEffect(() => {
    if (isLoaded) return; // Already loaded (return visit)
    const timer = setTimeout(() => {
      setIsLoaded(true);
      sessionStorage.setItem('orbit_has_visited', 'true');
    }, 3400); // Slightly after the 3.2s dice animation
    return () => clearTimeout(timer);
  }, [isLoaded]);


  // Defer chatbot loading until well after page is loaded
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => setShowChatbot(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Mobile UX: Scroll to hide address bar (simplified)
  useEffect(() => {
    const hideAddressBar = () => {
      window.scrollTo({ top: 1, behavior: 'smooth' });
    };
    setTimeout(hideAddressBar, 300);

    window.addEventListener('load', hideAddressBar);
    window.addEventListener('orientationchange', () => {
      setTimeout(hideAddressBar, 100);
    });

    return () => {
      window.removeEventListener('load', hideAddressBar);
      window.removeEventListener('orientationchange', hideAddressBar);
    };
  }, []);

  return (
    <>
      <StructuredData />
      <GlobalBackground />
      <div className="min-h-[100dvh] text-foreground relative z-0">
        <Navbar />
        <main>
          <Home />
          {isLoaded && (
            <>
              <StatsSection />
              <ServicesSection />
              <TechStackSection />
              <WhyUsSection />
              <ProjectsSection />
              <ReviewsSection />
              <LeadershipSection />
              <ContactSection />
            </>
          )}
        </main>
        {isLoaded && <OrbitFooter />}
        {isLoaded && (
          <Suspense fallback={null}>
            <LeadMagnetPopup />
          </Suspense>
        )}
        {showChatbot && (
          <Suspense fallback={null}>
            <Chatbot />
          </Suspense>
        )}
      </div>
    </>
  );
}

function AdminLoading() {
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { SEOHead } from './components/seo/SEOHead';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Consider data stale immediately
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: true, // Refetch on mount
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <SEOHead />
              <Suspense fallback={<AdminLoading />}>
                <Routes>
                  <Route path="/" element={<PublicSite />} />
                  <Route path="/project" element={<ProjectsPage />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/hero" replace />} />
                    <Route path="hero" element={<AdminHero />} />
                    <Route path="stats" element={<AdminStats />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="tech-stack" element={<AdminTechStack />} />
                    <Route path="why-us" element={<AdminWhyUs />} />
                    <Route path="project" element={<AdminProjects />} />
                    <Route path="leadership" element={<AdminLeadership />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="footer" element={<AdminFooter />} />
                    <Route path="chatbot" element={<AdminChatbot />} />
                    <Route path="links" element={<AdminLinks />} />
                    <Route path="navbar" element={<AdminNavbar />} />
                    <Route path="seo" element={<AdminSEO />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="backup" element={<AdminBackup />} />
                    <Route path="legal" element={<AdminLegal />} />

                  </Route>
                </Routes>
              </Suspense>
              <Analytics />
            </BrowserRouter>
          </LanguageProvider>
        </ContentProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
