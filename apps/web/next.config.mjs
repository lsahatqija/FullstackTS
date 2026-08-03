import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // Ensures file tracing includes the monorepo root (workspace packages) rather than just this app.
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

export default nextConfig;
