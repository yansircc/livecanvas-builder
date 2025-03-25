import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { Logo } from "./logo";
import { NavItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { UserAuthMenu } from "./user-auth-menu";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
async function getCachedSessionData(sessionData: Session) {
	"use cache";

	addAuthCacheTags(sessionData.user.id);
	return sessionData;
}

async function SuspenseUserAuthMenu() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);
	return <UserAuthMenu session={session} />;
}

export function MainNav() {
	return (
		<nav className="border-zinc-200 border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-6">
					<Logo />
					<NavItems />
				</div>
				<div className="flex items-center gap-4">
					<Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
						<SuspenseUserAuthMenu />
					</Suspense>
					<ThemeToggle />
				</div>
			</div>
		</nav>
	);
}
