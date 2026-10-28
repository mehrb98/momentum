import type { NextConfig } from "next";

const config: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["pg"],
    // Docker build skips tsc: it stalls small servers; run `npm run typecheck` before pushing instead
    typescript: { ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1" },
};

export default config;
