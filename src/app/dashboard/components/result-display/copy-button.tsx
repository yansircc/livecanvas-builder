import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleClick = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);

		// Reset after 2 seconds
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleClick}
			className={cn(
				"relative overflow-hidden transition-colors duration-150",
				copied
					? "cursor-not-allowed border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-800 dark:text-green-200"
					: "cursor-copy border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
			)}
			disabled={copied}
			title={copied ? "已复制" : "复制代码"}
		>
			<span
				className={cn(
					"absolute inset-0 flex items-center justify-center transition-opacity duration-150",
					copied ? "opacity-100" : "opacity-0",
				)}
			>
				<Check className="h-4 w-4" />
			</span>
			<span
				className={cn(
					"flex items-center justify-center transition-opacity duration-150",
					copied ? "opacity-0" : "opacity-100",
				)}
			>
				<Copy className="h-4 w-4" />
			</span>
		</Button>
	);
}
