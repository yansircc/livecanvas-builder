import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import { z } from "zod";

// Form schema definition
export const formSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	providerId: z.custom<AvailableProviderId>(),
	modelId: z.custom<AvailableModelId>(),
	withBackgroundInfo: z.boolean().default(false),
	precisionMode: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;
