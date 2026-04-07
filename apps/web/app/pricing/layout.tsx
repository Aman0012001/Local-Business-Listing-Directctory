import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing | naampata – Free & Basic Monthly Plans",
    description:
        "Choose the right plan for your local business. Start with our free listing or unlock all features with the Basic monthly plan — ₹2,000/month, cancel anytime.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
