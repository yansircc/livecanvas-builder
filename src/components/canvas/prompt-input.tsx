"use client";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import type { ModelId } from "@/lib/models";
import type { Control } from "react-hook-form";

interface PromptInputProps {
	control: Control<{
		model: ModelId;
		message: string;
	}>;
}

export function PromptInput({ control }: PromptInputProps) {
	return (
		<FormField
			control={control}
			name="message"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Prompt</FormLabel>
					<FormControl>
						<textarea
							className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter your prompt for code generation..."
							{...field}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
}
