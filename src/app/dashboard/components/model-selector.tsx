"use client";

import { Badge } from "@/components/ui/badge";
import type { AvailableProviderId, ModelList } from "@/lib/models";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./llm-form";

interface ModelSelectorProps {
	form: UseFormReturn<FormValues>;
	modelList: ModelList;
	isMounted: boolean;
}

export function ModelSelector({
	form,
	modelList,
	isMounted,
}: ModelSelectorProps) {
	const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
	const [currentModelName, setCurrentModelName] = useState<string>("");
	const menuRef = useRef<HTMLDivElement>(null);

	// Update model name when values change
	useEffect(() => {
		if (!isMounted) return;

		const providerId = form.getValues("providerId");
		const modelId = form.getValues("modelId");

		if (providerId && modelId) {
			const model = modelList[providerId]?.find((m) => m.id === modelId);
			setCurrentModelName(model?.name || modelId);
		}
	}, [isMounted, form, modelList]);

	// Subscribe to form value changes
	useEffect(() => {
		if (!isMounted) return;

		const subscription = form.watch((value, { name }) => {
			if (name === "providerId" || name === "modelId") {
				const providerId = value.providerId as AvailableProviderId;
				const modelId = value.modelId as string;

				if (providerId && modelId) {
					const model = modelList[providerId]?.find((m) => m.id === modelId);
					setCurrentModelName(model?.name || modelId);
				}
			}
		});

		return () => subscription.unsubscribe();
	}, [form, modelList, isMounted]);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsModelMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div
			className="flex items-center justify-between rounded-t-xl border-zinc-200 border-b bg-zinc-50 px-5 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
			ref={menuRef}
		>
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
					className="group flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors duration-150"
					aria-expanded={isModelMenuOpen}
					aria-haspopup="true"
				>
					<Brain className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
					<span className="font-medium text-zinc-800 dark:text-zinc-200">
						{isMounted ? (
							<Badge
								variant="outline"
								className="group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800"
							>
								{form.watch("providerId").toUpperCase()} - {currentModelName}
							</Badge>
						) : (
							"加载中..."
						)}
					</span>
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 dark:text-zinc-500",
							isModelMenuOpen && "rotate-180",
						)}
					/>
				</button>

				{isModelMenuOpen && (
					<div className="absolute top-full left-0 z-50 mt-1 w-72 overflow-hidden rounded-md border border-zinc-200 bg-white transition-colors duration-150 dark:border-zinc-700 dark:bg-zinc-800">
						{Object.entries(modelList).map(([providerId, models]) => (
							<div key={`provider-${providerId}`} className="px-3 py-2">
								<div className="mb-1.5 px-2 font-semibold text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
									{providerId.toUpperCase()}
								</div>
								<div className="space-y-1">
									{models.map((model) => (
										<button
											type="button"
											key={`model-${model.id}`}
											className={cn(
												"flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
												"hover:bg-zinc-100 dark:hover:bg-zinc-700",
												form.getValues("modelId") === model.id &&
													"bg-zinc-100 dark:bg-zinc-700",
											)}
											onClick={() => {
												form.setValue(
													"providerId",
													providerId as AvailableProviderId,
												);
												form.setValue("modelId", model.id);
												setCurrentModelName(model.name);
												setIsModelMenuOpen(false);
											}}
										>
											<div className="flex flex-1 items-center gap-2">
												<Brain className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
												<span className="text-zinc-800 dark:text-zinc-200">
													{model.name}
												</span>
											</div>
											<span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
												${model.price.input.toFixed(2)}/$
												{model.price.output.toFixed(2)}
											</span>
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
