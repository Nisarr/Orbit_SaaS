import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | ORBIT SaaS</title>
                <meta name="description" content="Privacy Policy for ORBIT SaaS — how we collect, use, and protect your data." />
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
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Last updated: March 2, 2026
                        </p>
                    </header>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you visit our website or use our services, we may collect the following types of information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                            <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and other contact details you voluntarily provide through our contact forms, chatbot, or email subscription.</li>
                            <li><strong className="text-foreground">Usage Data:</strong> Anonymous analytics data including page visits, browser type, device information, and interaction patterns to help us improve our website.</li>
                            <li><strong className="text-foreground">Cookies:</strong> We use essential cookies to ensure the proper functioning of our website. No third-party tracking cookies are used without your consent.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                            <li>To respond to your inquiries and provide requested services</li>
                            <li>To send you project updates and relevant communications (only if you opted in)</li>
                            <li>To improve our website, services, and user experience</li>
                            <li>To analyze website traffic and usage patterns</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not sell, rent, or trade your personal information to third parties. We may share data with trusted service providers who assist us in operating our website and services, subject to confidentiality agreements.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. To exercise these rights, please contact us using the information provided on our website.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our website may contain links to third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">7. Changes to This Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of our website after changes constitutes acceptance of the modified policy.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">8. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please reach out to us through our website's contact section.
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
