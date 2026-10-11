/** @type {import('next').NextConfig} */
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' blob: https:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Alias públicos neutros: los nombres editoriales no deben figurar en el HTML/JS del navegador.
  async rewrites() {
    return [{source:"/liry-assets/world-01.webp",destination:"/lirygames-games/skill-arena.webp"},{source:"/liry-assets/world-02.webp",destination:"/lirygames-games/inflabots-arena.webp"},{source:"/liry-assets/world-03.webp",destination:"/lirygames-games/la-batalla-del-dinero.webp"},{source:"/liry-assets/world-04.webp",destination:"/lirygames-games/gaias-last-stand.webp"},{source:"/liry-assets/world-05.webp",destination:"/lirygames-games/nexo-social.webp"},{source:"/liry-assets/world-06.webp",destination:"/lirygames-games/eternun.webp"},{source:"/liry-assets/world-07.webp",destination:"/lirygames-games/fragmentun.webp"},{source:"/liry-assets/world-08.webp",destination:"/lirygames-games/cripto-titans.webp"},{source:"/liry-assets/world-09.webp",destination:"/lirygames-games/codeverse.webp"}];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ],
      },
    ];
  },
};

export default nextConfig;
