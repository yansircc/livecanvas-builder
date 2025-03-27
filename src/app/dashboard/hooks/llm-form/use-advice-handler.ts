import { useCallback, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./schema";

export function useAdviceHandler(
	form: UseFormReturn<FormValues>,
	setHandleAdviceClick: (handler: (advice: string) => void) => void,
) {
	// Add a function to handle advice clicks
	const handleAdviceClick = useCallback(
		(advice: string) => {
			const currentPrompt = form.getValues("prompt");
			const newPrompt = `${currentPrompt}\n${advice}`;
			form.setValue("prompt", newPrompt);
		},
		[form],
	);

	// Register the handler in the store
	useEffect(() => {
		setHandleAdviceClick(handleAdviceClick);
		return () => {
			setHandleAdviceClick(() => {});
		};
	}, [handleAdviceClick, setHandleAdviceClick]);

	return { handleAdviceClick };
}
