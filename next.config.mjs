/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Keep sql.js out of webpack entirely — let Node require() it directly.
  // This avoids the "Cannot set properties of undefined (setting 'exports')"
  // error caused by sql.js's CJS initializer running inside the ESM webpack bundle.
  serverExternalPackages: ["sql.js"],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
