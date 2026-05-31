/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '2cleyyjiu4t0uoo0.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
