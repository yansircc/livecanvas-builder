"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/types/model";
import { Brain, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useDialogueStore } from "../../hooks";
import type { FormValues } from "./index";
import { RefreshModelsButton } from "./refresh-models-button";

const EXCHANGE_RATE = 7.3;

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
	const {
		getSelectedProvider,
		getSelectedModelId,
		setDialogueSelectedModel,
		activeDialogueId,
	} = useDialogueStore();

	// Update model name when values change or when active dialogue changes
	useEffect(() => {
		if (!isMounted) return;

		// Get current values from the store (these will work even when no submission exists)
		const providerId = getSelectedProvider();
		const modelId = getSelectedModelId();

		// Set the form values to match the store
		if (providerId && modelId) {
			form.setValue("providerId", providerId);
			form.setValue("modelId", modelId);

			const model = modelList[providerId]?.find((m) => m.id === modelId);
			setCurrentModelName(model?.name || modelId);
		}
	}, [isMounted, form, modelList, getSelectedProvider, getSelectedModelId]);

	// Subscribe to form value changes
	useEffect(() => {
		if (!isMounted) return;

		const subscription = form.watch((value, { name }) => {
			if (name === "providerId" || name === "modelId") {
				const providerId = value.providerId as AvailableProviderId;
				const modelId = value.modelId as string;

				if (providerId && modelId) {
					// Update current model name for display
					const model = modelList[providerId]?.find((m) => m.id === modelId);
					setCurrentModelName(model?.name || modelId);

					// Also update the dialogue store when form values change
					setDialogueSelectedModel(
						activeDialogueId,
						providerId,
						modelId as AvailableModelId,
					);
				}
			}
		});

		return () => subscription.unsubscribe();
	}, [form, modelList, isMounted, activeDialogueId, setDialogueSelectedModel]);

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
					className="group flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					aria-expanded={isModelMenuOpen}
					aria-haspopup="true"
				>
					<Brain className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
					<span className="font-medium text-zinc-800 dark:text-zinc-200">
						{isMounted ? (
							<Badge
								variant="outline"
								className="bg-white transition-colors duration-200 group-hover:bg-zinc-100 dark:bg-zinc-900 dark:group-hover:bg-zinc-800"
							>
								{form.watch("providerId").toUpperCase()} - {currentModelName}
							</Badge>
						) : (
							"加载中..."
						)}
					</span>
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
							isModelMenuOpen && "rotate-180",
						)}
					/>
				</button>

				{isModelMenuOpen && (
					<div className="absolute top-full left-0 z-50 mt-2 w-120 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg backdrop-blur-sm transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-800/95">
						<div className="flex items-center justify-between p-4">
							<h1 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
								模型列表
							</h1>
							<RefreshModelsButton />
						</div>
						{Object.entries(modelList).map(
							([providerId, models], index, array) => (
								<div
									key={`provider-${providerId}`}
									className={cn(
										"px-3 py-2.5",
										index !== array.length - 1 &&
											"border-zinc-100 border-b dark:border-zinc-700/50",
									)}
								>
									<div className="mb-1.5 px-2 font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
										{providerId.toUpperCase()}
									</div>
									<div className="grid grid-cols-2 gap-1.5">
										{models.map((model) => (
											<button
												type="button"
												key={`model-${model.id}`}
												className={cn(
													"flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-150",
													"hover:bg-zinc-50 dark:hover:bg-zinc-700/70",
													form.getValues("modelId") === model.id
														? "bg-zinc-100/80 ring-1 ring-zinc-200 dark:bg-zinc-700/50 dark:ring-zinc-600"
														: "border border-transparent",
												)}
												onClick={() => {
													const provId = providerId as AvailableProviderId;
													const modelId = model.id;

													// Update form values
													form.setValue("providerId", provId);
													form.setValue("modelId", modelId);

													// Also update the dialogue store
													setDialogueSelectedModel(
														activeDialogueId,
														provId,
														modelId as AvailableModelId,
													);

													// Immediately update the display name
													setCurrentModelName(model.name);
													setIsModelMenuOpen(false);
												}}
											>
												<span className="flex min-w-0 flex-1 items-center truncate font-medium text-zinc-800 dark:text-zinc-200">
													{model.name}
												</span>

												<span className="shrink-0 rounded-md border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-400">
													￥
													{Math.round(model.price.input * EXCHANGE_RATE * 10) /
														10}{" "}
													/ ￥
													{Math.round(model.price.output * EXCHANGE_RATE * 10) /
														10}
												</span>
											</button>
										))}
									</div>
								</div>
							),
						)}
					</div>
				)}
			</div>
		</div>
	);
}
