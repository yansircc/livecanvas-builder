import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Atom } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./llm-form";

interface PrecisionCheckboxProps {
	form: UseFormReturn<FormValues>;
	extraPromptCost: number;
}

export function PrecisionCheckbox({
	form,
	extraPromptCost,
}: PrecisionCheckboxProps) {
	const formValue = form.watch("precisionMode");
	// Local state to control animation
	const [isPrecisionMode, setIsPrecisionMode] = useState(formValue);

	// Keep local state in sync with form value
	useEffect(() => {
		setIsPrecisionMode(formValue);
	}, [formValue]);

	// Toggle precision mode
	const togglePrecisionMode = () => {
		const newValue = !isPrecisionMode;
		setIsPrecisionMode(newValue);
		form.setValue("precisionMode", newValue);
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={togglePrecisionMode}
						className={cn(
							"flex h-8 cursor-pointer items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
							isPrecisionMode
								? "border-purple-400 bg-purple-500/15 text-purple-500"
								: "border-transparent bg-zinc-200/50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-400 dark:hover:text-zinc-300",
						)}
					>
						<div className="flex h-4 w-4 shrink-0 items-center justify-center">
							<motion.div
								animate={{
									rotate: isPrecisionMode ? 180 : 0,
									scale: isPrecisionMode ? 1.1 : 1,
								}}
								whileHover={{
									rotate: isPrecisionMode ? 180 : 15,
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
								<Atom className="h-4 w-4" />
							</motion.div>
						</div>
						<AnimatePresence>
							{isPrecisionMode && (
								<motion.span
									initial={{ width: 0, opacity: 0 }}
									animate={{
										width: "auto",
										opacity: 1,
									}}
									exit={{ width: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="shrink-0 overflow-hidden whitespace-nowrap text-purple-500 text-sm"
								>
									精准模式
								</motion.span>
							)}
						</AnimatePresence>
					</button>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-xs">
					<p className="text-xs">
						精准模式会加载额外的参考文档，提供更精确的UI组件生成，但会额外消耗大约13k的token，关闭精准模式将节省
						{extraPromptCost}元
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
