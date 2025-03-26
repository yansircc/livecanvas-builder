import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy } from "lucide-react";
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
			variant="outline"
			size="icon"
			onClick={handleClick}
			className={cn(
				"relative overflow-hidden transition-colors duration-150",
				copied
					? "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
					: "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
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
				<CheckCircle2 className="h-4 w-4" />
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
