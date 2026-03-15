/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // Static export for Netlify / static hosting
    output: "export",

    // Disable Next image optimization (required for static export)
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },

    // Enable trailing slash for static hosting compatibility
    trailingSlash: true,

    // Improve build stability
    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;