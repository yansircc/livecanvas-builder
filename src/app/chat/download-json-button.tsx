import { Download, Loader2 } from "lucide-react";

interface DownloadJsonButtonProps {
	json: string;
	filename?: string;
	isLoading?: boolean;
}

export const DownloadJsonButton = ({
	json,
	filename = "acf-fields.json",
	isLoading = false,
}: DownloadJsonButtonProps) => {
	const handleDownload = () => {
		if (isLoading || !json) return;

		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<button
			type="button"
			onClick={handleDownload}
			disabled={isLoading}
			className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
				isLoading
					? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
					: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
			}`}
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
					<span>加载中</span>
				</>
			) : (
				<>
					<Download className="mr-1.5 h-3.5 w-3.5" />
					<span>下载 JSON</span>
				</>
			)}
		</button>
	);
};
