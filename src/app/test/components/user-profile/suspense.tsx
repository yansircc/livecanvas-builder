import { LoginForm } from "@/components/login-form";
import { auth } from "@/server/auth";
import { getCachedSessionData } from "./actions";
import { UserProfile } from "./client-comp";

/**
 * 异步组件
 * @returns 返回主UI
 */
export async function SuspenseUserProfile() {
	// throw new Error("这是一个测试错误，用于演示错误边界组件");
	// 先获取会话数据
	const sessionData = await auth();
	// 然后将其传递给缓存函数
	const session = await getCachedSessionData(sessionData);

	return (
		<section
			className="flex flex-col gap-4 rounded bg-gray-100 p-4 dark:bg-gray-800"
			aria-label="用户资料信息"
		>
			<h2 className="font-bold text-xl">用户资料</h2>

			{session ? (
				<UserProfile session={session} />
			) : (
				<div
					className="rounded-md bg-yellow-100 p-4 text-yellow-700"
					role="alert"
				>
					<p>请登录查看您的资料</p>
					<LoginForm />
				</div>
			)}
		</section>
	);
}

/**
 * 默认加载组件
 * @returns 返回加载中UI
 */
export function UserLoadingFallback() {
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
export function UserErrorFallback({ error }: { error: Error }) {
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
