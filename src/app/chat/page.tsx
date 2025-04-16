"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Create loading component
function ChatLoading() {
	return (
		<div className="flex h-[70vh] items-center justify-center">
			<Card className="w-full max-w-md border border-zinc-200 shadow-none dark:border-zinc-800">
				<CardContent className="flex flex-col items-center justify-center p-8 text-center">
					<Loader2
						className="mb-4 h-10 w-10 animate-spin text-zinc-400"
						aria-hidden="true"
					/>
					<h3 className="font-medium text-lg text-zinc-800 dark:text-zinc-200">
						加载中...
					</h3>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						聊天界面正在加载，请稍候
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

// Dynamic import of the chat component with SSR disabled
const ChatComponent = dynamic(() => import("./chat-component"), {
	ssr: false,
	loading: () => <ChatLoading />,
});

export default function ChatPage() {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 space-y-2">
					<h1 className="font-semibold text-2xl text-zinc-800 dark:text-zinc-200">
						WordPress ACF & LNL Generator
					</h1>
					<p className="text-zinc-500 dark:text-zinc-400">
						通过AI生成WordPress的ACF字段和LNL代码，轻松下载JSON文件或复制代码到剪贴板
					</p>
				</div>

				<div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
					<Suspense fallback={<ChatLoading />}>
						<ChatComponent />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
