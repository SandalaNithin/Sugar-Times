/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "sugartimes.co.in" },
      { protocol: "https", hostname: "st-be-kh3k.onrender.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/category/sugar/",
        destination: "/news/?category=Sugar%20Prices",
        permanent: true,
      },
      {
        source: "/category/sugar-sector/",
        destination: "/news/?category=Sugar%20Industry",
        permanent: true,
      },
      {
        source: "/category/featured/",
        destination: "/news/?category=Market%20Trends",
        permanent: true,
      },
      {
        source: "/category/ethanol/",
        destination: "/news/?category=Ethanol",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/about/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
