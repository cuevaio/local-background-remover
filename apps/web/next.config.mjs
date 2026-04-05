import createWithVercelToolbar from "@vercel/toolbar/plugins/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const withVercelToolbar = createWithVercelToolbar();

export default withVercelToolbar(nextConfig);
