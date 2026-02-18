import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true" && process.env.NODE_ENV === "production";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com"
      }
    ]
  }
};

export default nextConfig;
