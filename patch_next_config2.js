const fs = require('fs');
const content = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};
module.exports = nextConfig;
`;
fs.writeFileSync('next.config.js', content);
