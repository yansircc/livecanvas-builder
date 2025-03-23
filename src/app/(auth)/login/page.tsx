"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
				<h1 className="mb-6 text-center font-bold text-2xl">Login</h1>
				<Button
					className="w-full bg-indigo-500 hover:bg-indigo-600"
					onClick={() => signIn("discord", { callbackUrl: "/" })}
				>
					Sign in with Discord
				</Button>
			</div>
		</div>
	);
}
