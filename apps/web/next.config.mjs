/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    reactStrictMode: true,

    // SSR mode for Netlify (default)
    // output: 'export', // Removed for dynamic functionality

    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },

    // trailingSlash: false, // Standard Next.js behavior for SSR

    typescript: {
        ignoreBuildErrors: true, 
    },

};

export default nextConfig;