// next.config.js
const nextConfig = {
  images: {
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
    ],
  },
  // هدر X-Powered-By حذف شود (امنیت + جزئی سئو)
  poweredByHeader: false,
};

module.exports = nextConfig;
