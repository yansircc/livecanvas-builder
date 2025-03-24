/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	experimental: {
		reactCompiler: true,
		dynamicIO: true,
		useCache: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "cdn.discordapp.com",
			},
			{
				hostname: "images.unsplash.com",
			},
			{
				hostname: "livecanvas-builder.b-cdn.net",
			},
			{
				hostname: "*.vercel-storage.com",
			},
		],
	},
};

export default config;
