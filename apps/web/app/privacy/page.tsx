import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | naampata",
    description:
        "Understand how naampata collects, uses, and protects your personal information when you use our local business discovery platform.",
};

const lastUpdated = "March 1, 2026";

const sections = [
    {
        id: "overview",
        title: "1. Overview",
        content: `naampata ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform at naampata.com ("Platform").

By using the Platform, you consent to the practices described in this Privacy Policy. If you do not agree, please stop using the Platform.`,
    },
    {
        id: "information-collected",
        title: "2. Information We Collect",
        content: `We collect information you provide directly, information collected automatically, and information from third parties.

**Information You Provide:**
• Account registration details: name, email address, phone number, password
• Business listing information: business name, address, category, description, photos
• Payment information (processed securely through Stripe — we do not store card details)
• Communications you send us, including support requests and reviews

**Information Collected Automatically:**
• Log data: IP address, browser type, pages visited, time and date of visits
• Device information: operating system, device identifiers
• Usage data: features used, searches performed, interactions with listings
• Location data (if you grant permission) for relevant local search results
• Cookies and similar tracking technologies (see Section 7)

**Information from Third Parties:**
• Social login data (if you sign in with Google or other providers)
• Data from payment processors like Stripe related to completed transactions`,
    },
    {
        id: "how-we-use",
        title: "3. How We Use Your Information",
        content: `We use your personal information to:

• Create and manage your account and business listings
• Process payments and manage subscriptions
• Personalise your experience and provide relevant local recommendations
• Send transactional emails (account confirmations, receipts, important updates)
• Send marketing communications (with your consent — you can opt out at any time)
• Respond to your queries and provide customer support
• Detect, investigate, and prevent fraudulent or harmful activities
• Comply with legal obligations and enforce our Terms of Service
• Improve the Platform through analytics and research`,
    },
    {
        id: "sharing",
        title: "4. Information Sharing & Disclosure",
        content: `We do not sell your personal information. We may share your information in the following limited circumstances:

**With Service Providers:** We engage trusted third-party companies to perform services on our behalf (payment processing, email delivery, analytics, cloud hosting). These providers access your information only as needed to perform their services and are bound by confidentiality obligations.

**Business Listings (Publicly Visible):** Information contained in business listings — including business name, address, phone number, category, and photos — is publicly visible and searchable on the Platform by design.

**Reviews:** User reviews and ratings are publicly visible. Your display name or initials may be shown alongside your review.

**Legal Requirements:** We may disclose information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect the rights, property, or safety of naampata, our users, or the public.

**Business Transfers:** In the event of a merger, acquisition, or sale of assets, user information may be transferred to the acquiring entity, subject to the same protections described in this policy.`,
    },
    {
        id: "data-retention",
        title: "5. Data Retention",
        content: `We retain your personal information for as long as your account is active or as needed to provide services. Specifically:

• Account data is retained until you delete your account
• Transaction records are retained for 7 years for legal and tax compliance
• Analytics data is retained in anonymised form indefinitely
• Log data is typically retained for 90 days

When you delete your account, we will delete or anonymise your personal information within 30 days, except where retention is required by law.`,
    },
    {
        id: "security",
        title: "6. Data Security",
        content: `We implement industry-standard security measures to protect your personal information, including:

• HTTPS encryption for all data in transit
• Secure, encrypted storage of sensitive data at rest
• Access controls limiting who within naampata can access personal data
• Regular security audits and vulnerability assessments
• Stripe's PCI-DSS compliant payment processing (we never store card numbers)

While we take data security seriously, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.`,
    },
    {
        id: "cookies",
        title: "7. Cookies & Tracking",
        content: `We use cookies and similar technologies to:

• Keep you logged in across sessions (essential cookies)
• Remember your preferences and settings
• Analyse how the Platform is used to improve functionality (analytics cookies)
• Deliver relevant content and listings

**Types of cookies we use:**
• Essential cookies: Required for the Platform to function — cannot be disabled
• Analytics cookies: Help us understand usage patterns (e.g., via anonymised analytics)
• Preference cookies: Remember your settings and preferences

You can control cookies through your browser settings. Disabling non-essential cookies will not prevent your use of the Platform but may affect your experience.`,
    },
    {
        id: "your-rights",
        title: "8. Your Rights",
        content: `Depending on your location, you may have the following rights regarding your personal information:

• **Access:** Request a copy of the personal information we hold about you
• **Correction:** Request that we correct inaccurate or incomplete information
• **Deletion:** Request that we delete your personal information (subject to legal retention requirements)
• **Portability:** Request your data in a machine-readable format
• **Objection:** Object to certain uses of your data, including direct marketing
• **Withdraw Consent:** Withdraw consent where processing is based on your consent

To exercise any of these rights, contact us at privacy@naampata.com. We will respond within 30 days.`,
    },
    {
        id: "children",
        title: "9. Children's Privacy",
        content: `naampata is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information promptly.

If you believe a minor has provided us with personal information, please contact us at privacy@naampata.com.`,
    },
    {
        id: "third-party",
        title: "10. Third-Party Links",
        content: `The Platform may contain links to third-party websites and services. This Privacy Policy does not apply to those third-party sites. We encourage you to review the privacy policies of any sites you visit through links on our Platform.

We are not responsible for the privacy practices or content of third-party websites.`,
    },
    {
        id: "changes",
        title: "11. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via email or by displaying a prominent notice on the Platform before the change takes effect.

The "Last Updated" date at the top of this policy reflects the date of the most recent changes. Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy.`,
    },
    {
        id: "contact-privacy",
        title: "12. Contact Us",
        content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Team at:

naampata
Bandra West, Mumbai 400050
Maharashtra, India

Email: privacy@naampata.com
Phone: +91 98765 43210

We aim to respond to all privacy-related enquiries within 30 days.`,
    },
];

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main>
                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#112D4E] via-[#1a3f6b] to-[#2D3E50] py-24 px-4">
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF7A30]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
                            <Shield className="w-3.5 h-3.5 text-[#FF7A30]" /> Privacy
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            Privacy <span className="text-[#FF7A30]">Policy</span>
                        </h1>
                        <p className="text-white/60 font-medium text-sm">Last updated: {lastUpdated}</p>
                    </div>
                </section>

                {/* ── Notice banner ── */}
                <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-4">
                    <div className="max-w-4xl mx-auto flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-800 font-medium">
                            Your privacy matters to us. We never sell your personal data to third parties. This policy explains exactly what we collect, how we use it, and the choices you have.
                        </p>
                    </div>
                </div>

                {/* ── Content ── */}
                <section className="py-16 px-4 bg-white">
                    <div className="max-w-5xl mx-auto flex gap-10 items-start">
                        {/* Sidebar TOC — desktop only */}
                        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Contents</p>
                            <nav className="space-y-1">
                                {sections.map(({ id, title }) => (
                                    <a
                                        key={id}
                                        href={`#${id}`}
                                        className="block text-xs font-semibold text-slate-500 hover:text-[#FF7A30] py-1.5 px-3 rounded-lg hover:bg-orange-50 transition-colors leading-snug"
                                    >
                                        {title}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* Main content */}
                        <div className="flex-1 min-w-0 space-y-10">
                            {sections.map(({ id, title, content }) => (
                                <div key={id} id={id} className="scroll-mt-28">
                                    <h2 className="text-xl font-black text-[#112D4E] mb-3 pb-3 border-b border-slate-100">{title}</h2>
                                    <div className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line">
                                        {content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Footer CTA ── */}
                <section className="bg-slate-50 border-t border-slate-100 py-12 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-slate-600 font-medium text-sm mb-4">
                            Questions about your data? We're committed to being transparent.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7A30] text-white font-bold rounded-xl hover:bg-[#E86920] text-sm transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                            >
                                Contact Privacy Team <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/terms"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#112D4E] font-bold rounded-xl hover:bg-slate-100 text-sm border border-slate-200 transition-all"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
