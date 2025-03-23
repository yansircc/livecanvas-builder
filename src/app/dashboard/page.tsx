import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
async function getCachedSessionData(sessionData: Session | null) {
	"use cache";
	cacheTag("auth");

	// 模拟一个加载延迟
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}

// 添加重新验证 auth 缓存的功能
async function revalidateUserProfile() {
	"use server";
	revalidateTag("auth");
}

async function SuspenseComponent() {
	const sessionData = await auth();
	const session = await getCachedSessionData(sessionData);

	return (
		<div className="flex flex-col items-center justify-center gap-4 p-6">
			<h1 className="mb-4 font-bold text-2xl">Next.js Auth Example</h1>

			<div className="mb-4">
				{session ? (
					<p className="text-green-600">
						✅ You are logged in as {session.user?.name}
					</p>
				) : (
					<p className="text-red-600">❌ You are not logged in</p>
				)}
			</div>

			<div className="flex gap-4">
				<Link
					href="/protected"
					className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Protected Page
				</Link>

				{session ? (
					<Link
						href="/api/auth/signout"
						className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Sign Out
					</Link>
				) : (
					<Link
						href="/login"
						className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
					>
						Sign In
					</Link>
				)}
			</div>

			<form action={revalidateUserProfile}>
				<button
					type="submit"
					className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Revalidate User Profile
				</button>
			</form>
		</div>
	);
}

export default async function Home() {
	return (
		<div className="mx-auto flex min-h-screen flex-col">
			<MainNav />
			<main className="container mx-auto flex-1">
				<Suspense fallback={<p>Loading...</p>}>
					<SuspenseComponent />
				</Suspense>
			</main>
			<Footer />
		</div>
	);
}
