import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./schema";

export function useFormInitialization(
	form: UseFormReturn<FormValues>,
	isMounted: boolean,
	selectedProviderId: AvailableProviderId | null,
	selectedModelId: AvailableModelId | null,
	activeDialogueId: number,
	getSelectedProvider: () => AvailableProviderId | null,
	getSelectedModelId: () => AvailableModelId | null,
) {
	// Ref to prevent infinite loops in useEffect
	const isUpdatingModelRef = useRef<boolean>(false);
	// Ref for previous provider and model IDs to detect changes
	const prevProviderIdRef = useRef<AvailableProviderId | null>(null);
	const prevModelIdRef = useRef<AvailableModelId | null>(null);
	// Track dialogue changes with a ref
	const prevDialogueIdRef = useRef<number>(activeDialogueId);
	// Ref to track if initial setup is done
	const initialSetupDoneRef = useRef<boolean>(false);

	// One-time setup of the form after component mounts
	useEffect(() => {
		if (
			isMounted &&
			!initialSetupDoneRef.current &&
			selectedProviderId &&
			selectedModelId
		) {
			initialSetupDoneRef.current = true;

			// Set initial values
			prevProviderIdRef.current = selectedProviderId;
			prevModelIdRef.current = selectedModelId;

			// Only set the form values if they're different from the current values
			const currentProviderId = form.getValues("providerId");
			const currentModelId = form.getValues("modelId");

			if (currentProviderId !== selectedProviderId) {
				form.setValue("providerId", selectedProviderId, { shouldDirty: false });
			}

			if (currentModelId !== selectedModelId) {
				form.setValue("modelId", selectedModelId, { shouldDirty: false });
			}
		}
	}, [isMounted, selectedProviderId, selectedModelId, form]);

	// Update form when dialogue changes
	useEffect(() => {
		if (isMounted && prevDialogueIdRef.current !== activeDialogueId) {
			prevDialogueIdRef.current = activeDialogueId;
			const currentProviderId = getSelectedProvider();
			const currentModelId = getSelectedModelId();

			prevProviderIdRef.current = currentProviderId;
			prevModelIdRef.current = currentModelId;

			// Default provider if null/undefined
			const providerId =
				currentProviderId || ("anthropic" as AvailableProviderId);
			// Only reset if we have a valid model ID
			if (currentModelId) {
				form.reset({
					prompt: "",
					providerId,
					modelId: currentModelId,
					withBackgroundInfo: false,
					precisionMode: false,
				});
			}
		}
	}, [
		activeDialogueId,
		form,
		getSelectedProvider,
		getSelectedModelId,
		isMounted,
	]);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			initialSetupDoneRef.current = false;
		};
	}, []);

	return {
		isUpdatingModelRef,
		prevProviderIdRef,
		prevModelIdRef,
		initialSetupDoneRef,
	};
}
