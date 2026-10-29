import type { NextConfig } from "next";

const config: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["pg"],
    typescript: { ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1" },
};

export default config;
