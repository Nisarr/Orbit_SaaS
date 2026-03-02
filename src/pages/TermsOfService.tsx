import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <>
            <Helmet>
                <title>Terms of Service | ORBIT SaaS</title>
                <meta name="description" content="Terms of Service for ORBIT SaaS — the terms and conditions governing your use of our website and services." />
            </Helmet>

            <div className="min-h-[100dvh] bg-background text-foreground">
                {/* Header */}
                <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                    <header>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Last updated: March 2, 2026
                        </p>
                    </header>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using the ORBIT SaaS website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">2. Services</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            ORBIT SaaS provides custom software development, AI integration, web and mobile application development, and related digital services. The specific scope, deliverables, and timelines for any project will be defined in a separate agreement or proposal.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">3. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All content on this website — including text, graphics, logos, images, and code — is the property of ORBIT SaaS or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">4. User Conduct</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When using our website and services, you agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                            <li>Use the website for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to our systems or data</li>
                            <li>Interfere with the proper functioning of the website</li>
                            <li>Submit false or misleading information through any forms</li>
                            <li>Scrape, crawl, or use automated tools to extract content without permission</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">5. Project Agreements</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Any development project undertaken by ORBIT SaaS will be governed by a separate project agreement that outlines scope, pricing, payment terms, timelines, and deliverables. These Terms of Service serve as a general framework and do not supersede project-specific agreements.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            ORBIT SaaS shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services. Our total liability for any claim shall not exceed the amounts paid by you for the specific service in question.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">7. Disclaimer</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our website and services are provided "as is" without warranties of any kind, express or implied. We do not guarantee that the website will be uninterrupted, error-free, or free of harmful components.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">8. Modifications</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to this page. Your continued use of the website after modifications constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved through good-faith negotiation or, if necessary, through the appropriate legal channels.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For questions about these Terms of Service, please reach out to us through our website's contact section.
                        </p>
                    </section>

                    {/* Back link */}
                    <div className="pt-8 border-t border-border">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Homepage
                        </Link>
                    </div>
                </article>
            </div>
        </>
    );
}
