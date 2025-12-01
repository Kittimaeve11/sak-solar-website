/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  trailingSlash : true,
  experimental : {
     forceSwcTransforms : true
  },


  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/LocationPhoto/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/picturePC/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/pictureMoblie/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/Service/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/productTypeReviewapi/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/Reviewapi/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/policyapi/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/policyIDapi/POL202507290'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/policyIDapi/POL202507297'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/policyIDapi/POL202507298'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/Misstion/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/Teams/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/branderhomeapi/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/edittormainpageapi/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/Gallery/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/LocationPhoto/**',
      }

    ],
  },

  //  เพิ่ม rewrite rule สำหรับสินค้า (เปลี่ยน URL เป็น slug)
async rewrites() {
    return [
      {
        source: '/products/solar-rooftop/:brandSlug/:productID',
        destination: '/products/1/:brandSlug/:productID',
      },
      {
        source: '/products/solar-rooftop-hybrid/:brandSlug/:productID',
        destination: '/products/4/:brandSlug/:productID',
      },
      {
        source: '/products/solar-air/:brandSlug/:productID',
        destination: '/products/2/:brandSlug/:productID',
      },
    ];
  },

  //  Redirect API ออกไป Backend จริง (ไม่ให้ Next.js Build /api)
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.saksiamsolar.com/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;