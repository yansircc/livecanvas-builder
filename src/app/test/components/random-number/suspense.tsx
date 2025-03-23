import { revalidateTag } from "next/cache";
import { getRandomNumberWithAuth } from "./actions";

/**
 * 异步组件
 * @returns 返回主UI
 */
export async function SuspenseRandomNumber() {
	const { randomNumber, session } = await getRandomNumberWithAuth();
	return (
		<section
			className="flex flex-col gap-4 rounded bg-gray-100 p-4 dark:bg-gray-800"
			aria-label="随机数信息"
		>
			<h2 className="font-bold text-xl">随机数: {randomNumber}</h2>
			<p>用户状态: {session ? `已登录 (${session.user?.name})` : "未登录"}</p>
			<form
				action={async () => {
					"use server";
					revalidateTag("random-number");
				}}
			>
				<button
					type="submit"
					className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
					aria-label="刷新随机数"
				>
					刷新随机数
				</button>
			</form>
		</section>
	);
}

/**
 * 默认加载组件
 * @returns 返回加载中UI
 */
export function RandomLoadingFallback() {
	return (
		<div className="space-y-4" aria-live="polite" aria-busy="true">
			<div className="animate-pulse rounded-md bg-gray-200 p-4 dark:bg-gray-700">
				<div className="mb-2 h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-600" />
				<div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600" />
			</div>
			<div className="h-10 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
			<span className="sr-only">内容加载中，请稍候...</span>
		</div>
	);
}

/**
 * 错误回退组件
 * @param error 错误对象
 * @returns 返回错误回退UI
 */
export function RandomErrorFallback({ error }: { error: Error }) {
	return (
		<div
			className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
			role="alert"
		>
			<h3 className="font-medium">加载出错</h3>
			<p className="mt-1 text-sm">{error.message}</p>
		</div>
	);
}
