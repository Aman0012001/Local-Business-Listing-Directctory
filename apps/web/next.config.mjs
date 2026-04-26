const nextConfig = {
    // Removed output: 'export' to allow dynamic SSR/ISR on Netlify/Railway
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;