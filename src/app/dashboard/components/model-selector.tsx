"use client";

import type { AvailableProviderId, ModelList } from "@/lib/models";
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

	return (
		<div
			className="flex items-center justify-between border-black/10 border-b px-4 py-2 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400"
			ref={menuRef}
		>
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
					className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5"
				>
					<Brain className="h-4 w-4 dark:text-white" />
					<span className="dark:text-white">
						{isMounted ? (
							<>
								{form.watch("providerId").toUpperCase()} - {currentModelName}
							</>
						) : (
							"加载中..."
						)}
					</span>
					<ChevronDown className="ml-0.5 h-3 w-3 dark:text-white" />
				</button>

				{isModelMenuOpen && (
					<div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-zinc-800">
						{Object.entries(modelList).map(([providerId, models]) => (
							<div key={`provider-${providerId}`} className="px-3 py-2">
								<div className="mb-1 font-medium text-xs text-zinc-500 dark:text-zinc-400">
									{providerId.toUpperCase()}
								</div>
								{models.map((model) => (
									<button
										type="button"
										key={`model-${model.id}`}
										className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
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
											<Brain className="h-4 w-4" />
											<span>{model.name}</span>
										</div>
										<span className="text-xs text-zinc-500 dark:text-zinc-400">
											${model.price.input.toFixed(2)}/$
											{model.price.output.toFixed(2)}
										</span>
									</button>
								))}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
