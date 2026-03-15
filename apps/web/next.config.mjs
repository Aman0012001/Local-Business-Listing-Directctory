/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // enable static export for traditional hosting
    output: 'export',

    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

export default nextConfig;