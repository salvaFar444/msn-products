/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Esto permite que tu web muestre las fotos que subas a Supabase
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;