import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
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
        <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
            <body className="bg-white text-slate-900 min-h-screen antialiased font-sans" suppressHydrationWarning>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
