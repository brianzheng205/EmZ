/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_PULL_REQUEST_TARGET: process.env.VERCEL_GIT_PULL_REQUEST_TARGET,
  },
};

export default nextConfig;
