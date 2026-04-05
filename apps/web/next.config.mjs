/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,

    // Static export mode (produces the "out" folder used for local static hosting)
    output: "export",

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