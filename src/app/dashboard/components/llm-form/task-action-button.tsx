"use client";

import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/common";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskActionButtonProps {
	isLoading: boolean;
	isSubmitting: boolean;
	taskId: string | null;
	taskStatus: TaskStatus | null;
	cancelTask: (taskId: string) => Promise<boolean>;
	hasContent: boolean; // 是否有内容可提交
	onCancelingChange?: (isCanceling: boolean) => void; // 用于传递取消状态回父组件
}

export function TaskActionButton({
	isLoading,
	isSubmitting,
	taskId,
	taskStatus,
	cancelTask,
	hasContent,
	onCancelingChange,
}: TaskActionButtonProps) {
	// 添加本地状态来控制取消按钮的显示
	const [isCanceling, setIsCanceling] = useState(false);

	// 当取消状态改变时通知父组件
	useEffect(() => {
		onCancelingChange?.(isCanceling);
	}, [isCanceling, onCancelingChange]);

	// 监控任务状态变化来重置取消状态
	useEffect(() => {
		if (taskStatus === "CANCELED") {
			// 任务已取消，但保持取消按钮再显示1.5秒，让用户看到反馈
			setTimeout(() => {
				setIsCanceling(false);
			}, 1500);
		}
	}, [taskStatus]);

	// 处理任务取消
	const handleCancelTask = async () => {
		if (taskId) {
			setIsCanceling(true); // 设置为取消中状态
			await cancelTask(taskId);

			// 如果3秒后状态还没变成CANCELED，也恢复按钮
			setTimeout(() => {
				if (taskStatus !== "CANCELED") {
					setIsCanceling(false);
				}
			}, 3000);
		}
	};

	// 按钮是否禁用
	const buttonDisabled = isLoading || isSubmitting;

	// 返回按钮的JSX
	const ButtonContent =
		(isLoading && taskId) || isCanceling ? (
			// 取消按钮 - 当任务正在加载或正在取消时显示
			<button
				type="button"
				onClick={handleCancelTask}
				disabled={isCanceling} // 正在取消时禁用按钮，防止重复点击
				className={cn(
					"flex cursor-pointer items-center justify-center rounded-md bg-zinc-100 p-2.5 text-zinc-900 transition-colors duration-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
					isCanceling && "opacity-70", // 取消状态下添加轻微的透明度
				)}
				title={isCanceling ? "正在取消..." : "取消生成任务"}
				aria-label={isCanceling ? "正在取消..." : "取消生成任务"}
			>
				<div
					className={cn(
						"h-4 w-4 animate-spin rounded-sm",
						isCanceling
							? "bg-zinc-400 dark:bg-zinc-500"
							: "bg-red-400 dark:bg-red-600",
					)}
					style={{ animationDuration: "3s" }}
				/>
			</button>
		) : (
			// 提交按钮 - 正常状态
			<button
				type="submit"
				disabled={buttonDisabled && !taskId} // 只有当没有taskId时才禁用
				className={cn(
					"rounded-md p-2.5 transition-colors duration-150",
					hasContent && !buttonDisabled
						? "cursor-pointer bg-zinc-100 text-zinc-900 hover:border-sky-400 hover:bg-sky-500/15 hover:text-sky-500 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-sky-500/15 dark:hover:text-sky-500"
						: "cursor-not-allowed bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800",
				)}
			>
				{isSubmitting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Send className="h-4 w-4" />
				)}
			</button>
		);

	return <div className="absolute right-4 bottom-4">{ButtonContent}</div>;
}
