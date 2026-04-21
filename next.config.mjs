/** @type {import('next').NextConfig} */
import { withKumaUI } from '@kuma-ui/next-plugin';

const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_ENV: 'development'
  }
}

export default withKumaUI(nextConfig);
