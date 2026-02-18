// next.config.js
const nextConfig = {
  images: {
    // qualities: [80, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'laaktqtviwcazwfufalq.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;