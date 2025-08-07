/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Disable ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Configure image domains for external images
  images: {
    domains: ["cdn.weatherapi.com"],
  },

  // ✅ Rewrite API routes to backend server
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
