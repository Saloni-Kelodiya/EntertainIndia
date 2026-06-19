import withBundleAnalyzer from '@next/bundle-analyzer';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Trailing slash fix
  trailingSlash: false,
  
  // ✅ Redirects
  async redirects() {
    return [
      {
        source: '/article/:slug/',
        destination: '/article/:slug',
        permanent: true,
      },
      {
        source: '/news/:slug/',
        destination: '/news/:slug',
        permanent: true,
      },
    ];
  },
  
  // ✅ IMAGE OPTIMIZATION
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.entertainindia.com',
      },
      {
        protocol: 'https',
        hostname: 'img.entertainindia.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  
  // ❌ REMOVE swcMinify - Deprecated in Next.js 15+
  // swcMinify: true,  // ← DELETE this line
  
  // ✅ Keep compress (works fine)
  compress: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ✅ Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash'],
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },
  
  poweredByHeader: false,
  
  env: {
    STRAPI_BACKEND_URL: process.env.STRAPI_BACKEND_URL || 'http://localhost:1337/api',
  },
  
  productionBrowserSourceMaps: false,
  
  // ❌ FIX: Remove /_next/image/:path* headers (Next.js handles automatically)
  async headers() {
    return [
      // ❌ Remove this entire block
      // {
      //   source: '/_next/image/:path*',
      //   headers: [
      //     {
      //       key: 'Cache-Control',
      //       value: 'public, max-age=31536000, immutable',
      //     },
      //   ],
      // },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
