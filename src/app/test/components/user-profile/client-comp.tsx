"use client";

import type { Session } from "next-auth";
import { revalidateUserProfile } from "./actions";

interface UserProfileProps {
	session: Session;
}

export function UserProfile({ session }: UserProfileProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-4">
				{session.user?.image && (
					<img
						src={session.user.image}
						alt={session.user.name || "用户头像"}
						className="h-12 w-12 rounded-full"
						width={48}
						height={48}
					/>
				)}
				<div>
					<p className="font-medium">{session.user?.name}</p>
					<p className="text-gray-500 text-sm">{session.user?.email}</p>
					<p className="text-gray-400 text-xs">ID: {session.user?.id}</p>
				</div>
			</div>

			<form action={revalidateUserProfile}>
				<button
					type="submit"
					className="mt-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
					aria-label="刷新用户资料"
				>
					刷新资料
				</button>
			</form>
			<div>
				<p>背景信息: {session.user?.backgroundInfo}</p>
			</div>
		</div>
	);
}
