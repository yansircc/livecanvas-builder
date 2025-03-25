/* eslint-disable import/no-anonymous-default-export */
export default {
	// TypeScript, JavaScript files
	"*.{ts,tsx,js,jsx}": (files) => [
		"bun typecheck",
		`bun format ${files.join(" ")}`,
	],

	// Other files
	"*.{json,mdx}": (files) => [`bun format ${files.join(" ")}`],

	// 明确忽略 tsbuildinfo 文件
	"!tsconfig.tsbuildinfo": [],
};
