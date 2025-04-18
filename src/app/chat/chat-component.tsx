"use client";

import { useApiKeyStore } from "@/store/use-apikey-store";
import { useChat } from "@ai-sdk/react";
import { Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { CopyLNLButton } from "./copy-lnl-button";
import { DownloadJsonButton } from "./download-json-button";

function ChatError() {
	return (
		<div className="flex h-[60vh] items-center justify-center">
			<div className="rounded-md border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
				<h3 className="mb-2 font-medium text-lg text-red-700 dark:text-red-400">
					出现错误
				</h3>
				<p className="text-red-600 dark:text-red-300">
					加载聊天界面时出错。请稍后再试。
				</p>
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center text-center">
			<div className="mb-4 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
				<MessageSquare className="h-8 w-8 text-zinc-400" aria-hidden="true" />
			</div>
			<h3 className="mb-2 font-medium text-lg text-zinc-800 dark:text-zinc-200">
				开始新对话
			</h3>
			<p className="max-w-sm text-zinc-500 dark:text-zinc-400">
				输入您的问题，让AI为您生成WordPress的ACF字段或LNL代码
			</p>
		</div>
	);
}

interface AcfGenerationInfo {
	id: string;
	json: string;
	messageId: string;
}

interface LnlGenerationInfo {
	id: string;
	code: string;
	messageId: string;
}

// 定义错误响应的接口
interface ErrorResponse {
	error: string;
}

export default function ChatComponent() {
	const apiKey = useApiKeyStore((state) => state.apiKey);

	const { messages, input, handleInputChange, handleSubmit, status, error } =
		useChat({
			api: "/api/chat",
			maxSteps: 10,
			body: {
				apiKey,
			},
			onError: (
				error: Error & { response?: { json?: () => Promise<unknown> } },
			) => {
				// 检查是否包含自定义错误消息
				const errorResponse = error?.response?.json?.();
				if (errorResponse) {
					errorResponse
						.then((data: unknown) => {
							const errorData = data as ErrorResponse;
							if (errorData?.error) {
								toast.error(errorData.error);
							} else {
								toast.error("AI聊天请求失败");
							}
						})
						.catch(() => {
							toast.error(error.message || "AI聊天请求失败");
						});
				} else {
					toast.error(error.message || "AI聊天请求失败");
				}
			},
		});
	const [acfGenerations, setAcfGenerations] = useState<AcfGenerationInfo[]>([]);
	const [lnlGenerations, setLnlGenerations] = useState<LnlGenerationInfo[]>([]);

	const isLoading = status === "submitted" || status === "streaming";
	const hasMessages = messages.length > 0;

	useEffect(() => {
		const newAcfGenerations: AcfGenerationInfo[] = [];
		const newLnlGenerations: LnlGenerationInfo[] = [];

		// Process all messages to find new generations
		for (const message of messages) {
			for (let i = 0; i < message.parts.length; i++) {
				const part = message.parts[i];
				if (!part) continue;
				if (
					part.type === "tool-invocation" &&
					"toolInvocation" in part &&
					part.toolInvocation &&
					typeof part.toolInvocation === "object" &&
					"toolName" in part.toolInvocation &&
					"result" in part.toolInvocation
				) {
					// Check for ACF generation
					if (part.toolInvocation.toolName === "generateACFFields") {
						const acfGenerationId = `${message.id}-acf-${i}`;
						const acfJson = JSON.stringify(part.toolInvocation.result, null, 2);

						// Only add if not already in state
						if (!acfGenerations.some((gen) => gen.id === acfGenerationId)) {
							newAcfGenerations.push({
								id: acfGenerationId,
								json: acfJson,
								messageId: message.id,
							});
						}
					}

					// Check for LNL code generation
					if (part.toolInvocation.toolName === "generateLNLCode") {
						const lnlGenerationId = `${message.id}-lnl-${i}`;
						const lnlCode = part.toolInvocation.result.code;

						// Only add if not already in state
						if (!lnlGenerations.some((gen) => gen.id === lnlGenerationId)) {
							newLnlGenerations.push({
								id: lnlGenerationId,
								code: lnlCode,
								messageId: message.id,
							});
						}
					}
				}
			}
		}

		// Update state if we have new generations
		if (newAcfGenerations.length > 0) {
			setAcfGenerations((prev) => [...prev, ...newAcfGenerations]);
		}

		if (newLnlGenerations.length > 0) {
			setLnlGenerations((prev) => [...prev, ...newLnlGenerations]);
		}
	}, [messages, acfGenerations, lnlGenerations]);

	// 检查API密钥是否设置
	useEffect(() => {
		if (!apiKey && hasMessages) {
			toast.warning("请先在设置中填写API密钥");
		}
	}, [apiKey, hasMessages]);

	const handleFormSubmit = (e: React.FormEvent) => {
		if (!apiKey) {
			e.preventDefault();
			toast.warning("请先在设置中填写API密钥");
			return;
		}
		handleSubmit(e);
	};

	return (
		<ErrorBoundary fallback={<ChatError />}>
			<div className="mx-auto flex w-full flex-col">
				<div className="flex-1 space-y-4 pb-20">
					{!hasMessages ? (
						<EmptyState />
					) : (
						<>
							{messages.map((message) => {
								// 检查此消息是否包含ACF生成结果
								const acfResults: { id: string; json: string }[] = [];

								// 检查此消息是否包含LNL代码生成结果
								const lnlResults: { id: string; code: string }[] = [];

								// 处理消息部分并检查生成
								message.parts.forEach((part, i) => {
									if (
										part.type === "tool-invocation" &&
										part.toolInvocation &&
										typeof part.toolInvocation === "object" &&
										"toolName" in part.toolInvocation &&
										"result" in part.toolInvocation
									) {
										// 检查ACF生成
										if (part.toolInvocation.toolName === "generateACFFields") {
											const acfJson = JSON.stringify(
												part.toolInvocation.result,
												null,
												2,
											);
											const acfGenerationId = `${message.id}-acf-${i}`;
											acfResults.push({
												id: acfGenerationId,
												json: acfJson,
											});
										}

										// 检查LNL代码生成
										if (part.toolInvocation.toolName === "generateLNLCode") {
											const lnlCode = part.toolInvocation.result.code;
											const lnlGenerationId = `${message.id}-lnl-${i}`;
											lnlResults.push({
												id: lnlGenerationId,
												code: lnlCode,
											});
										}
									}
								});

								const isUserMessage = message.role === "user";

								return (
									<div
										key={message.id}
										className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`w-fit max-w-[80%] rounded-lg px-4 py-3 ${
												isUserMessage
													? "bg-primary text-primary-foreground"
													: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
											}`}
										>
											{/* 显示消息文本内容 */}
											{message.parts.map((part, i) => {
												if (part.type === "text") {
													return (
														<div
															key={`${message.id}-${i}`}
															className="whitespace-pre-wrap"
														>
															{part.text}
														</div>
													);
												}
												return null; // 不显示工具调用的JSON
											})}

											{/* 显示所有ACF生成结果 */}
											{acfResults.map((result) => (
												<div
													key={result.id}
													className="mt-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
												>
													<div className="flex items-center justify-between">
														<span className="text-green-600 text-sm dark:text-green-400">
															✅ ACF 字段已生成
														</span>
														<DownloadJsonButton
															json={result.json}
															filename={`acf-fields-${Date.now()}.json`}
															isLoading={false}
														/>
													</div>
												</div>
											))}

											{/* 显示所有LNL代码生成结果 */}
											{lnlResults.map((result) => (
												<div
													key={result.id}
													className="mt-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
												>
													<div className="flex items-center justify-between">
														<span className="text-emerald-600 text-sm dark:text-emerald-400">
															✅ LNL 代码已生成
														</span>
														<CopyLNLButton
															code={result.code}
															isLoading={false}
														/>
													</div>
												</div>
											))}
										</div>
									</div>
								);
							})}

							{/* 显示正在加载的状态 - 只在有消息且状态为loading时显示 */}
							{isLoading && hasMessages && (
								<div className="flex justify-start">
									<div className="w-fit max-w-[80%] rounded-lg bg-zinc-100 px-4 py-3 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
											<span>AI正在思考...</span>
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="fixed right-0 bottom-0 left-0 mx-auto max-w-4xl bg-gradient-to-t from-70% from-white pt-6 pb-8 dark:from-zinc-950">
					<form onSubmit={handleFormSubmit} className="relative mx-4">
						<input
							className="w-full rounded-md border border-zinc-300 bg-white p-3 pr-10 pl-4 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-primary dark:focus:ring-primary"
							value={input}
							placeholder="询问有关 ACF 字段或请求生成 LNL 代码..."
							onChange={handleInputChange}
							disabled={isLoading}
						/>
						{isLoading && (
							<div className="-translate-y-1/2 absolute top-1/2 right-3">
								<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
							</div>
						)}
					</form>
				</div>
			</div>
		</ErrorBoundary>
	);
}
