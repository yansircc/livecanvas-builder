import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { refreshModels } from "../actions/refresh-models";

export const RefreshModelsButton = () => {
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (isRefreshing) return;

		try {
			setIsRefreshing(true);
			await refreshModels();
			toast.success("模型列表已刷新", {
				description: (
					<p className="text-muted-foreground text-sm">
						请使用{" "}
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
							<span className="text-xs">⌘/Ctrl</span> +{" "}
							<span className="text-xs">Shift</span> +{" "}
							<span className="text-xs">R</span>
						</kbd>{" "}
						刷新页面
					</p>
				),
			});
		} catch (error) {
			toast.error("刷新模型列表失败");
		} finally {
			// Keep the state true to prevent animation reset
			// The component will remount after revalidation anyway
			setIsRefreshing(true);
		}
	};

	return (
		<Button variant="ghost" size="icon" onClick={handleRefresh} type="button">
			<RotateCw
				className={cn(
					"h-4 w-4",
					isRefreshing && "animate-[spin_1s_ease-in-out]",
				)}
			/>
		</Button>
	);
};
