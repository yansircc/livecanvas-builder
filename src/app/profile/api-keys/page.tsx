"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeyStore } from "@/store/use-apikey-store";
import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ApiKeys() {
	const { apiKey, setApiKey } = useApiKeyStore();
	const [key, setKey] = useState(apiKey || "");
	const [isLoading, setIsLoading] = useState(false);
	const [showKey, setShowKey] = useState(false);

	// Update local state when store changes
	useEffect(() => {
		setKey(apiKey || "");
	}, [apiKey]);

	// Save API key to store (persistence handled by Zustand)
	const handleSaveApiKey = async () => {
		setIsLoading(true);

		try {
			// Save to zustand store with persist middleware
			setApiKey(key);

			toast.success("API密钥保存成功");
		} catch (error) {
			console.error("保存API密钥失败:", error);
			toast.error("保存API密钥失败");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<CardHeader>
				<CardTitle>API密钥</CardTitle>
				<CardDescription>管理你的 AIHubMix API密钥以生成内容</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label
						htmlFor="api-key"
						className="font-medium text-sm text-zinc-900 dark:text-zinc-100"
					>
						AIHubMix API密钥
					</Label>
					<div className="flex space-x-2">
						<div className="relative flex-1">
							<Input
								id="api-key"
								type={showKey ? "text" : "password"}
								value={key}
								onChange={(e) => setKey(e.target.value)}
								placeholder="输入你的AIHubMix API密钥"
								className="border-zinc-200 bg-white pr-10 dark:border-zinc-700 dark:bg-zinc-800"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute top-0 right-0 h-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
								onClick={() => setShowKey(!showKey)}
							>
								{showKey ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
						<Button
							onClick={handleSaveApiKey}
							disabled={isLoading}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isLoading ? (
								<span className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									保存中
								</span>
							) : (
								<span className="flex items-center gap-2">
									<Save className="h-4 w-4" />
									保存
								</span>
							)}
						</Button>
					</div>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						你的API密钥存储在本地，不会发送给我们的服务器
					</p>
				</div>

				<div className="rounded-md bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
					<h3 className="font-medium text-sm">如何获取API密钥</h3>
					<ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
						<li>
							注册一个账户在{" "}
							<a
								href="https://aihubmix.com?aff=P6qM"
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:text-amber-900 dark:hover:text-amber-200"
							>
								AIHubMix
							</a>
						</li>
						<li>导航到你的账户设置</li>
						<li>生成一个新的API密钥</li>
						<li>复制并粘贴到这里</li>
					</ol>
				</div>
			</CardContent>
			<CardFooter className="border-zinc-200 border-t bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					API密钥用于验证对 AIHubMix API的请求
				</p>
			</CardFooter>
		</Card>
	);
}
