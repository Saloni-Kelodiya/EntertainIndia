// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   trailingSlash: false,

//   images: {
//     formats: ['image/avif', 'image/webp'],
//     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     minimumCacheTTL: 31536000,
//     dangerouslyAllowSVG: true,
//     remotePatterns: [
//       { protocol: 'https', hostname: 'admin.entertainindia.com' },
//       { protocol: 'https', hostname: 'img.entertainindia.com' },
//       { protocol: 'https', hostname: 'img.youtube.com' },
//       { protocol: 'https', hostname: 'i.ytimg.com' },
//       { protocol: 'http', hostname: 'localhost' },
//     ],
//   },

//   compress: true,
//   productionBrowserSourceMaps: false,
//   poweredByHeader: false,

//   compiler: {
//     removeConsole: process.env.NODE_ENV === 'production',
//   },

//   experimental: {
//     inlineCss: true,
//     optimizePackageImports: ['lucide-react', 'date-fns', 'lodash'],
//     webpackBuildWorker: true,
//     parallelServerCompiles: true,
//     parallelServerBuildTraces: true,
//   },

//   // ✅ Keep-Alive: Strapi se connection reuse hoga — TTFB kam hoga
//   httpAgentOptions: {
//     keepAlive: true,
//   },

//   env: {
//     STRAPI_BACKEND_URL:
//       process.env.STRAPI_BACKEND_URL || 'http://localhost:1337/api',
//   },

//   // ✅ Trailing slash rewrites — SEO ke liye clean URLs


//   async headers() {
//     return [
//       // ✅ Static assets — 1 year immutable cache
//       {
//         source: '/_next/static/:path*',
//         headers: [
//           { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
//         ],
//       },

//       // ✅ Public folder assets — 1 year cache
//       {
//         source: '/static/:path*',
//         headers: [
//           { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
//         ],
//       },

//       // ✅ Favicon & manifest — long cache
//       {
//         source: '/:file(favicon.ico|robots.txt|sitemap.xml|manifest.json)',
//         headers: [
//           { key: 'Cache-Control', value: 'public, max-age=86400' },
//         ],
//       },

//       // ✅ Pages — 1 hour cache + stale-while-revalidate
//       {
//         source: '/((?!_next/static|_next/image|static|api).*)',
//         headers: [
//           { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
//           { key: 'X-Content-Type-Options', value: 'nosniff' },
//           { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
//           { key: 'X-XSS-Protection',       value: '1; mode=block' },
//           // ✅ NEW: Preconnect Strapi aur image CDN se
//           {
//             key: 'Link',
//             value: [
//               '<https://admin.entertainindia.com>; rel=preconnect',
//               '<https://img.entertainindia.com>; rel=preconnect',
//             ].join(', '),
//           },
//         ],
//       },

//       // ✅ API routes — no cache
//       {
//         source: '/api/:path*',
//         headers: [
//           { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
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
  
  images: {
    formats: ['image/avif', 'image/webp'],
   deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], 
    minimumCacheTTL: 31536000, //  1 साल का इमेज कैशिंग नियम चालू है
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.entertainindia.com' },
      { protocol: 'https', hostname: 'img.entertainindia.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'http', hostname: 'localhost' }
    ],
  },
  
  compress: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
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
  
  async headers() {
    return [
      // 🚀 1. फ़िक्स: Next.js के सभी कोड चंक्स (Chunks) और CSS को 1 साल के लिए लॉन्ग-टर्म कैश पर सेट किया
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 🚀 2. फ़िक्स: पब्लिक स्टेटिक एसेट्स के लिए 1 साल का कैशिंग नियम
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 🚀 3. फ़िक्स: सामान्य पेजों के लिए 1 घंटे का कैश (यह अब कोड चंक्स को डिस्टर्ब नहीं करेगा)
      {
        source: '/((?!_next/static|_next/image|static|api).*)', 
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
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
