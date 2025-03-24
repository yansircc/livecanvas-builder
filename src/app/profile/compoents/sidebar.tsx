import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, User } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";
import { Suspense } from "react";
import { MenuItems } from "./menu-items";

// Dynamic user profile component that needs Suspense
function UserProfile({ session }: { session: Session | null }) {
	return (
		<>
			<div className="relative">
				<div className="relative h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
					{session?.user?.image ? (
						<Avatar className="h-full w-full">
							<AvatarImage src={session.user.image} />
							<AvatarFallback>
								{session.user.name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<User className="h-10 w-10 text-zinc-500" />
						</div>
					)}
				</div>
				<div className="absolute right-0 bottom-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
			</div>
			<div className="text-center">
				<h2 className="font-semibold text-xl text-zinc-900 dark:text-zinc-100">
					{session?.user?.name || "用户"}
				</h2>
				<p className="text-zinc-600 dark:text-zinc-400">
					{session?.user?.email}
				</p>
			</div>
		</>
	);
}

// Skeleton loader for user profile
function UserProfileSkeleton() {
	return (
		<>
			<div className="relative">
				<div className="relative h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
					<Skeleton className="h-full w-full rounded-full" />
				</div>
				<div className="absolute right-0 bottom-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
			</div>
			<div className="text-center">
				<Skeleton className="mx-auto mb-1 h-6 w-24" />
				<Skeleton className="mx-auto h-4 w-32" />
			</div>
		</>
	);
}

interface SidebarProps {
	session: Session | null;
}

export function Sidebar({ session }: SidebarProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<div className="px-6 pt-8 pb-6">
				{/* Profile header - only wrap the dynamic user data in Suspense */}
				<div className="mb-6 flex flex-col items-center gap-4">
					<Suspense fallback={<UserProfileSkeleton />}>
						<UserProfile session={session} />
					</Suspense>
				</div>

				<div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

				{/* Menu items - static content, no need for Suspense */}
				<MenuItems />

				<div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

				{/* Logout button - static content, no need for Suspense */}
				<Link
					href="/api/auth/signout"
					className="flex w-full items-center gap-2 rounded-lg p-2.5 text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/10"
				>
					<LogOut className="h-4 w-4" />
					<span className="font-medium text-sm">退出</span>
				</Link>
			</div>
		</div>
	);
}
