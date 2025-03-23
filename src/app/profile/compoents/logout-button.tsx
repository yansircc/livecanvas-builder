"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	return (
		<Button
			className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
			type="button"
			onClick={() => signOut()}
		>
			<div className="flex items-center gap-2">
				<LogOut className="h-4 w-4 text-red-500" />
				<span className="font-medium text-red-500 text-sm">退出</span>
			</div>
		</Button>
	);
}
