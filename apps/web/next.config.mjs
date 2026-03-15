/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // remove static export because project has dynamic routes
    // output: 'export',

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