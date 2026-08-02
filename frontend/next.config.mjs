/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/marketing", destination: "/marketing-suite", permanent: false },
      { source: "/content", destination: "/content-studio", permanent: false },
      { source: "/dev", destination: "/dev-bay", permanent: false },
      { source: "/ops", destination: "/operations-hub", permanent: false },
      { source: "/finance", destination: "/finance-office", permanent: false },
      { source: "/research", destination: "/research-lab", permanent: false },
    ];
  },
};

export default nextConfig;
