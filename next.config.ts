import type { NextConfig } from "next";
import dotenv from 'dotenv';
dotenv.config();

const nextConfig: NextConfig = {
  /* config options here */
    output: "standalone",
    env: {
        JENKINS_URL: process.env.JENKINS_URL,
        JENKINS_TOKEN: process.env.JENKINS_TOKEN,
    },
};

export default nextConfig;
