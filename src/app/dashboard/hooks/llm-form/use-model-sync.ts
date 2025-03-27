import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import { useEffect } from "react";
import type { RefObject } from "react";

export function useModelSync(
	watchedProviderId: AvailableProviderId,
	watchedModelId: AvailableModelId,
	selectedProviderId: AvailableProviderId | null,
	selectedModelId: AvailableModelId | null,
	isMounted: boolean,
	isUpdatingModelRef: RefObject<boolean>,
	prevProviderIdRef: RefObject<AvailableProviderId | null>,
	prevModelIdRef: RefObject<AvailableModelId | null>,
	initialSetupDoneRef: RefObject<boolean>,
	setGlobalModel: (
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) => void,
) {
	// Handle model changes from the form to the global store
	useEffect(() => {
		if (
			!isMounted ||
			isUpdatingModelRef.current ||
			!watchedProviderId ||
			!watchedModelId ||
			!initialSetupDoneRef.current
		)
			return;

		// Only update if the provider or model actually changed AND it's not the initial render
		const providerChanged =
			prevProviderIdRef.current !== null &&
			watchedProviderId !== selectedProviderId &&
			watchedProviderId !== prevProviderIdRef.current;

		const modelChanged =
			prevModelIdRef.current !== null &&
			watchedModelId !== selectedModelId &&
			watchedModelId !== prevModelIdRef.current;

		if (providerChanged || modelChanged) {
			isUpdatingModelRef.current = true;
			setGlobalModel(watchedProviderId, watchedModelId);
			prevProviderIdRef.current = watchedProviderId;
			prevModelIdRef.current = watchedModelId;
			isUpdatingModelRef.current = false;
		}
	}, [
		watchedProviderId,
		watchedModelId,
		selectedProviderId,
		selectedModelId,
		setGlobalModel,
		isMounted,
		isUpdatingModelRef,
		prevProviderIdRef,
		prevModelIdRef,
		initialSetupDoneRef,
	]);
}
