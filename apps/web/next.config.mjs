/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // Dynamic build for Netlify (SSR supported via @netlify/plugin-nextjs)
    // output: "export" is intentionally disabled — static export breaks API routes

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

    // trailingSlash intentionally removed — it causes redirect loops with Next.js v5 runtime
    // trailingSlash: true,

    typescript: {
        ignoreBuildErrors: false,
    },

    // Allow Railway backend domain for server-side fetch
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                ],
            },
        ];
    },
};

export default nextConfig;