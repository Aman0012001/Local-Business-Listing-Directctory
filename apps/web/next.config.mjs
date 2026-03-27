/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // Static export for Netlify / static hosting
    output: "export", // Enabled for static hosting

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


    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;