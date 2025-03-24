"use client";

import { Palette } from "lucide-react";
import { useEffect } from "react";

interface ThemeSwitcherProps {
	availableThemes: string[];
	currentTheme: string | null;
	onThemeChange: (theme: string) => void;
}

export function ThemeSwitcher({
	availableThemes,
	currentTheme,
	onThemeChange,
}: ThemeSwitcherProps) {
	// Add event listener to handle click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const dropdown = document.getElementById("theme-dropdown");
			const button = document.getElementById("theme-button");

			if (
				dropdown &&
				!dropdown.contains(event.target as Node) &&
				button &&
				!button.contains(event.target as Node)
			) {
				dropdown.classList.add("hidden");
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (availableThemes.length === 0) return null;

	return (
		<div className="relative">
			<div className="flex items-center">
				<button
					id="theme-button"
					type="button"
					className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-neutral-700 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
					onClick={() => {
						const dropdown = document.getElementById("theme-dropdown");
						if (dropdown) {
							dropdown.classList.toggle("hidden");
						}
					}}
					title="切换主题"
				>
					<Palette className="h-3.5 w-3.5" />
					<span className="max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">
						{currentTheme || "主题"}
					</span>
				</button>
			</div>

			<div
				id="theme-dropdown"
				className="absolute right-0 z-50 mt-1 hidden w-48 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div className="px-3 py-1.5 font-medium text-neutral-500 text-xs dark:text-neutral-400">
					可用主题
				</div>
				<div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
				{availableThemes.map((theme) => (
					<button
						type="button"
						key={theme}
						className={`flex w-full items-center px-3 py-1.5 text-left text-sm ${
							theme === currentTheme
								? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
								: "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
						}`}
						onClick={() => {
							onThemeChange(theme);
							const dropdown = document.getElementById("theme-dropdown");
							if (dropdown) {
								dropdown.classList.add("hidden");
							}
						}}
					>
						{theme === currentTheme && (
							<span className="mr-2 text-blue-600 dark:text-blue-400">✓</span>
						)}
						<span className={theme === currentTheme ? "font-medium" : ""}>
							{theme}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
