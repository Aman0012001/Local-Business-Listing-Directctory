/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    reactStrictMode: true,

    // Standard build mode (SSR) for Netlify.

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

    // Enable trailingSlash for Netlify static exports to avoid 404s on RSC payload fetches
    trailingSlash: true,

    typescript: {
        ignoreBuildErrors: false,
    },

};

export default nextConfig;