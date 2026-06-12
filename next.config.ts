import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.reuters.com" },
      { protocol: "https", hostname: "**.bbc.com" },
      { protocol: "https", hostname: "**.bbc.co.uk" },
      { protocol: "https", hostname: "**.apnews.com" },
      { protocol: "https", hostname: "**.aljazeera.com" },
      { protocol: "https", hostname: "**.eldeber.com.bo" },
      { protocol: "https", hostname: "**.los tiempos.com" },
      { protocol: "https", hostname: "**.emergot.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
