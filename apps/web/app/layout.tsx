import "./globals.css";
import { AuthProvider } from '../context/AuthContext';

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
        <html lang="en">
            <body className="bg-white text-slate-900 min-h-screen antialiased font-sans">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
