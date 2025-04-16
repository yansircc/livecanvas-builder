import { Check, Loader2 } from "lucide-react";
import React from "react";

interface CopyLNLButtonProps {
	code: string;
	isLoading?: boolean;
}

export const CopyLNLButton = ({
	code,
	isLoading = false,
}: CopyLNLButtonProps) => {
	const [copied, setCopied] = React.useState(false);

	const handleCopy = () => {
		if (isLoading || !code) return;

		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch((err) => {
				console.error("Failed to copy code:", err);
			});
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			disabled={isLoading}
			className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
				isLoading
					? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
					: copied
						? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
						: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
			}`}
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
					<span>加载中</span>
				</>
			) : copied ? (
				<>
					<Check className="mr-1.5 h-3.5 w-3.5" />
					<span>已复制</span>
				</>
			) : (
				<span>复制 LNL 代码</span>
			)}
		</button>
	);
};
