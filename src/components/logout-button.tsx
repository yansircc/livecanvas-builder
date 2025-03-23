"use client";

import { logout } from "@/app/actions";
import { useState } from "react";

interface LogoutButtonProps {
	className?: string;
	variant?: "default" | "icon";
}

export function LogoutButton({
	className = "",
	variant = "default",
}: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleLogout() {
		setIsLoading(true);
		await logout({ redirectTo: "/" });
	}

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={handleLogout}
				disabled={isLoading}
				className={`inline-flex h-9 w-9 items-center justify-center rounded-md font-medium text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 ${className}`}
				aria-label="Logout"
			>
				{isLoading ? (
					<svg
						className="h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						aria-label="Loading"
					>
						<title>Loading</title>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
				) : (
					<svg
						className="h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-label="Logout icon"
					>
						<title>Logout icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
				)}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={isLoading}
			className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-800 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-700 ${className}`}
		>
			{isLoading ? (
				<svg
					className="mr-2 h-4 w-4 animate-spin"
					viewBox="0 0 24 24"
					aria-label="Loading"
				>
					<title>Loading</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
			) : null}
			{isLoading ? "Signing out..." : "Sign out"}
		</button>
	);
}
