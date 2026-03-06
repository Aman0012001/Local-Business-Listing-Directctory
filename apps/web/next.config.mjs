/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
