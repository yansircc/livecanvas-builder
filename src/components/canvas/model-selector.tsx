"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MODELS, type ModelId } from "@/lib/models";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";

interface ModelSelectorProps {
	control: Control<{
		model: ModelId;
		message: string;
	}>;
}

export function ModelSelector({ control }: ModelSelectorProps) {
	const { field } = useController({
		name: "model",
		control,
	});

	return (
		<div className="space-y-2">
			<Label htmlFor="model">Model</Label>
			<Select value={field.value} onValueChange={field.onChange}>
				<SelectTrigger id="model">
					<SelectValue placeholder="Select a model" />
				</SelectTrigger>
				<SelectContent>
					{MODELS.map((model) => (
						<SelectItem key={model.id} value={model.id}>
							{model.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
