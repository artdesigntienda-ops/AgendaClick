import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://checkout.wompi.co https://*.wompi.co https://vercel.live https://*.vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
      "font-src 'self' https://fonts.gstatic.com https://frontend-cdn.perplexity.ai https://vercel.live https://assets.vercel.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com https://www.transparenttextures.com https://vercel.live https://vercel.com",
      "connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://api.resend.com https://*.wompi.co https://www.google.com https://www.recaptcha.net https://vercel.live https://*.vercel.live wss://ws-us3.pusher.com",
      "frame-src https://www.google.com https://www.recaptcha.net https://checkout.wompi.co https://*.wompi.co https://vercel.live https://*.vercel.live",
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['googleapis'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
