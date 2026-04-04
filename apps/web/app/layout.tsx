import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { Toaster } from 'react-hot-toast';
import { Roboto } from "next/font/google";
import Script from "next/script";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
    style: ["normal", "italic"],
    variable: "--font-roboto",
    display: "swap",
});

const baseUrl = process.env.NODE_ENV === 'production' 
    ? "https://nampata.netlify.app"
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(baseUrl),
    title: "naampata | Find Local Businesses",
    description:
        "Discover the best local businesses, services, and products in your neighborhood.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "naampata | Find Local Businesses",
        description: "Discover the best local businesses, services, and products in your neighborhood.",
        url: baseUrl,
        siteName: "naampata",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "naampata | Find Local Businesses",
        description: "Discover the best local businesses, services, and products in your neighborhood.",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={roboto.variable} suppressHydrationWarning>
            <body
                className={`${roboto.className} bg-white text-slate-900 min-h-screen antialiased`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <SocketProvider>{children}</SocketProvider>
                </AuthProvider>

                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,visualization,marker&loading=async`}
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}