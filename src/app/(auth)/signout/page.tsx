"use client";

import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function SignOut() {
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		if (countdown <= 0) {
			logout({ redirectTo: "/" });
			return;
		}

		const timer = setTimeout(() => {
			setCountdown(countdown - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown]);

	return (
		<div className="flex min-h-[80vh] items-center justify-center">
			<Card
				className={cn(
					"mx-auto w-fit rounded-3xl",
					"bg-white dark:bg-[#121212]",
					"border-2 border-zinc-100 dark:border-zinc-800/50",
					"shadow-[0_24px_48px_-12px] shadow-zinc-900/10 dark:shadow-black/30",
				)}
			>
				<CardHeader className="space-y-4 px-8 pt-10">
					<div className="space-y-2 text-center">
						<CardTitle className="bg-linear-to-r from-zinc-800 to-zinc-600 bg-clip-text font-bold text-2xl text-transparent dark:from-white dark:to-zinc-400">
							退出登录
						</CardTitle>
						<CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
							正在为您安全退出...
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 p-8 pt-4">
					<div className="grid grid-cols-1 gap-3">
						<div className="flex flex-col items-center justify-center space-y-4">
							<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<LogOut className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
								<div className="-right-1 -top-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
									{countdown}
								</div>
							</div>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{countdown > 0
									? `${countdown}秒后自动返回首页...`
									: "正在返回首页..."}
							</p>
						</div>

						<Button
							className="mt-4 h-12 w-full bg-linear-to-r from-zinc-800 to-zinc-700 font-medium text-white hover:from-zinc-700 hover:to-zinc-600 dark:from-zinc-200 dark:to-zinc-300 dark:text-zinc-800 dark:hover:from-zinc-300 dark:hover:to-zinc-400"
							onClick={() => logout({ redirectTo: "/" })}
						>
							立即退出
						</Button>
					</div>
				</CardContent>

				<CardFooter className="px-8 pt-2 pb-10">
					<div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
						感谢您的使用，期待您的再次登录
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
