/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // ✅ THIS IS MUST (Next 16 export)
    // ✅ Switch to dynamic build for production (Netlify support)
    // output: "export",

    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },

    trailingSlash: true,

    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;