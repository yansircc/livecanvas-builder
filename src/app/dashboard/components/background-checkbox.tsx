import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CircleFadingPlus, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./llm-form";

interface BackgroundCheckboxProps {
	form: UseFormReturn<FormValues>;
	hasBackgroundInfo: boolean;
	backgroundInfo?: string;
}

export function BackgroundCheckbox({
	form,
	hasBackgroundInfo,
	backgroundInfo = "",
}: BackgroundCheckboxProps) {
	const formValue = form.watch("withBackgroundInfo");
	// Local state to control animation
	const [isEnabled, setIsEnabled] = useState(formValue);

	// Keep local state in sync with form value
	useEffect(() => {
		setIsEnabled(formValue);
	}, [formValue]);

	// Toggle background info setting
	const toggleBackgroundInfo = () => {
		const newValue = !isEnabled;
		setIsEnabled(newValue);
		form.setValue("withBackgroundInfo", newValue);
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={toggleBackgroundInfo}
						className={cn(
							"flex h-8 cursor-pointer items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
							isEnabled && hasBackgroundInfo
								? "border-sky-400 bg-sky-500/15 text-sky-500"
								: isEnabled && !hasBackgroundInfo
									? "border-amber-400 bg-amber-500/15 text-amber-500"
									: "border-transparent bg-zinc-200/50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-400 dark:hover:text-zinc-300",
						)}
					>
						<div className="flex h-4 w-4 shrink-0 items-center justify-center">
							<motion.div
								animate={{
									rotate: isEnabled ? 180 : 0,
									scale: isEnabled ? 1.1 : 1,
								}}
								whileHover={{
									rotate: isEnabled ? 180 : 15,
									scale: 1.1,
									transition: {
										type: "spring",
										stiffness: 300,
										damping: 10,
									},
								}}
								transition={{
									type: "spring",
									stiffness: 260,
									damping: 25,
								}}
							>
								{isEnabled && !hasBackgroundInfo ? (
									<InfoIcon className={cn("h-4 w-4", "text-amber-500")} />
								) : (
									<CircleFadingPlus
										className={cn(
											"h-4 w-4",
											isEnabled && hasBackgroundInfo
												? "text-sky-500"
												: "text-inherit",
										)}
									/>
								)}
							</motion.div>
						</div>
						<AnimatePresence>
							{isEnabled && (
								<motion.span
									initial={{ width: 0, opacity: 0 }}
									animate={{
										width: "auto",
										opacity: 1,
									}}
									exit={{ width: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className={cn(
										"shrink-0 overflow-hidden whitespace-nowrap text-sm",
										hasBackgroundInfo ? "text-sky-500" : "text-amber-500",
									)}
								>
									背景信息
								</motion.span>
							)}
						</AnimatePresence>
					</button>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-xs">
					{hasBackgroundInfo ? (
						<div className="max-h-[200px] overflow-y-auto text-xs">
							<p className="mb-1 font-medium">背景信息:</p>
							<p className="whitespace-pre-wrap">{backgroundInfo}</p>
						</div>
					) : (
						<p className="text-xs">
							你尚未设置背景信息。请在个人资料页面添加背景信息，以便AI更好地理解你的需求。
						</p>
					)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
