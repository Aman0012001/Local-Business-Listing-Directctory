/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    reactStrictMode: true,

    // Static export mode only during production build (produces the "out" folder for Netlify).
    // In dev mode we skip this so dynamic routes work without the generateStaticParams constraint.
    ...(isProd && { output: "export" }),

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