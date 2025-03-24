import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Suspense } from "react";
import { Sidebar } from "./compoents/sidebar";

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

function SidebarSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<div className="px-6 pt-8 pb-6">
				{/* Profile header skeleton */}
				<div className="mb-6 flex flex-col items-center gap-4">
					<Skeleton className="h-20 w-20 rounded-full" />
					<div className="w-full space-y-2">
						<Skeleton className="mx-auto h-6 w-24" />
						<Skeleton className="mx-auto h-4 w-32" />
					</div>
				</div>

				<div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

				{/* Menu items skeleton */}
				<div className="space-y-2">
					<Skeleton className="h-10 w-full rounded-lg" />
					<Skeleton className="h-10 w-full rounded-lg" />
					<Skeleton className="h-10 w-full rounded-lg" />
				</div>

				<div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

				{/* Logout button skeleton */}
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
		</div>
	);
}

async function SuspenseSidebar() {
	const sessionData = await auth();
	const session = await getCachedSessionData(sessionData);
	return <Sidebar session={session} />;
}

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
			<MainNav />
			<main className="flex-1 py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-12">
						{/* Left sidebar with profile card */}
						<div className="md:col-span-4 lg:col-span-3">
							<Suspense fallback={<SidebarSkeleton />}>
								<SuspenseSidebar />
							</Suspense>
						</div>

						{/* Right content area */}
						<div className="md:col-span-8 lg:col-span-9">{children}</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
