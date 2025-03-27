import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { EditProfileDialog } from "./compoents/edit-profile-dialog";

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

async function SusppenseEditProfileDialog() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);

	return <EditProfileDialog session={session} />;
}

async function SuspenseUserName() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);

	return (
		<p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
			{session?.user?.name}
		</p>
	);
}

async function SuspenseUserEmail() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);

	return (
		<p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
			{session?.user?.email}
		</p>
	);
}

async function SuspenseUserBackgroundInfo() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);

	if (!session?.user?.backgroundInfo) {
		return (
			<p className="mt-1 font-medium text-zinc-500 dark:text-zinc-100">
				尚未添加背景信息。点击&quot;编辑资料&quot;按钮添加你的背景信息，以便AI更好地理解你的需求。
			</p>
		);
	}

	return (
		<pre className="mt-1 whitespace-pre-wrap font-medium text-sm text-zinc-500 dark:text-zinc-100">
			{session?.user?.backgroundInfo}
		</pre>
	);
}

export default async function ProfilePage() {
	return (
		<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>个人信息</CardTitle>
					<CardDescription>查看和管理你的个人信息</CardDescription>
				</div>
				<Suspense fallback={<Skeleton className="h-10 w-24 rounded-md" />}>
					<SusppenseEditProfileDialog />
				</Suspense>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
						基本信息
					</h3>
					<div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
							<p className="text-sm text-zinc-500 dark:text-zinc-400">姓名</p>
							<Suspense fallback={<Skeleton className="mt-1 h-6 w-40" />}>
								<SuspenseUserName />
							</Suspense>
						</div>
						<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								电子邮件（暂不支持修改）
							</p>
							<Suspense fallback={<Skeleton className="mt-1 h-6 w-48" />}>
								<SuspenseUserEmail />
							</Suspense>
						</div>
					</div>
				</div>

				<div>
					<h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
						背景信息
					</h3>
					<div className="mt-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
						<Suspense
							fallback={
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
									<Skeleton className="h-4 w-4/6" />
								</div>
							}
						>
							<SuspenseUserBackgroundInfo />
						</Suspense>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
