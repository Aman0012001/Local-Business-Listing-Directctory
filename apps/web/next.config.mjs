/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // Static export mode (produces the "out" folder used for local static hosting)
    // output: "export",

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

};

export default nextConfig;