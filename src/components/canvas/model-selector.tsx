"use client";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MODELS, type ModelId } from "@/lib/models";
import type { Control } from "react-hook-form";

interface ModelSelectorProps {
	control: Control<{
		model: ModelId;
		message: string;
	}>;
}

export function ModelSelector({ control }: ModelSelectorProps) {
	return (
		<FormField
			control={control}
			name="model"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Model</FormLabel>
					<Select value={field.value} onValueChange={field.onChange}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select a model" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{MODELS.map((model) => (
								<SelectItem key={model.id} value={model.id}>
									{model.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormItem>
			)}
		/>
	);
}
