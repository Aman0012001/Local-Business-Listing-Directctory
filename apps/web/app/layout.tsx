import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata = {
    title: "LocalFind | Find Local Businesses",
    description: "Discover the best local businesses, services, and products in your neighborhood.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body className="bg-white text-slate-900 min-h-screen antialiased font-sans" suppressHydrationWarning>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
