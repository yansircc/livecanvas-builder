// In a Next.js app with dynamicIO, we can't use new Date() directly without proper handling
// For copyright year in a footer, it's better to use a fixed value that won't change frequently

import { cn } from "@/lib/utils";

interface FooterProps {
	className?: string;
}

export function Footer({ className }: FooterProps) {
	// For a copyright year, we can use a fixed year since this rarely needs to be dynamic
	// and avoids the dynamicIO date issue
	const currentYear = 2025; // Set to the current year manually

	return (
		<footer
			className={cn(
				"border-zinc-200 border-t bg-white py-4 dark:border-zinc-800 dark:bg-zinc-900",
				className,
			)}
		>
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between">
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						© {currentYear} LiveCanvas Builder
					</p>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						使用 AI 构建美观的 HTML 组件
					</p>
				</div>
			</div>
		</footer>
	);
}
