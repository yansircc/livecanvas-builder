import { tool } from "ai";
import { z } from "zod";
import {
	type ACFField,
	type FieldOptions,
	createFieldGroup,
	createGalleryField,
	createImageField,
	createNumberField,
	createRepeaterField,
	createSelectField,
	createTextField,
	createTextareaField,
} from "../acf";
import { type ACFFieldGroup, acfFieldGroupSchema } from "../acf/schemas";

// Define AI-specific field schema using Zod for AI model output
interface AIFieldSchema {
	type: string;
	label: string;
	name: string;
	instructions?: string;
	required?: number | boolean;
	choices?: Record<string, string>;
	sub_fields?: AIFieldSchema[];
}

const acfAIFieldSchema: z.ZodType<AIFieldSchema> = z.object({
	type: z.enum([
		"text",
		"textarea",
		"number",
		"gallery",
		"image",
		"select",
		"wysiwyg",
		"true_false",
		"date_picker",
		"repeater",
	]),
	label: z.string(),
	name: z.string(),
	instructions: z.string().optional(),
	required: z.union([z.number(), z.boolean()]).optional(),
	choices: z.record(z.string()).optional(),
	sub_fields: z.array(z.lazy(() => acfAIFieldSchema)).optional(),
});

// Create ACF fields from field options
function processFields(fields: FieldOptions[]): ACFField[] {
	return fields.map((field) => {
		const baseOptions = {
			label: field.label,
			name: field.name,
			instructions: field.instructions,
			required: field.required,
		};

		// Merge any field-specific options
		const options = { ...baseOptions };

		// Add choices for select fields
		if (field.type === "select" && field.choices) {
			(options as Record<string, unknown>).choices = field.choices;
		}

		// Handle repeater fields with sub_fields
		if (field.type === "repeater" && field.sub_fields) {
			(options as Record<string, unknown>).sub_fields = processFields(
				field.sub_fields,
			);
		}

		// Create the appropriate field type
		switch (field.type) {
			case "text":
				return createTextField(options);
			case "textarea":
				return createTextareaField(options);
			case "number":
				return createNumberField(options);
			case "gallery":
				return createGalleryField(options);
			case "image":
				return createImageField(options);
			case "select":
				return createSelectField(options);
			case "repeater":
				return createRepeaterField(options);
			default:
				return createTextField(options);
		}
	});
}

// Define result type for our tool
interface ACFGeneratorResult {
	fieldGroup: ACFFieldGroup | null;
}

// Define the generate ACF fields tool
export const generateACFFieldsTool = tool({
	description: `Generate ACF field groups based on user requirements.
    Before generating the field group, confirm with the user whether they have created the post type using the ACF plugin and ask for confirmation before generating the field group.
    If the user's request is unclear, especially regarding the post type name, ask for clarification.`,
	parameters: acfFieldGroupSchema,
	execute: async (acfFieldGroup): Promise<ACFGeneratorResult> => {
		try {
			// Process the fields
			const processedFields = processFields(
				acfFieldGroup.fields as FieldOptions[],
			);

			// Create the field group with type safe properties
			const fieldGroup = createFieldGroup({
				title: acfFieldGroup.title,
				fields: processedFields,
				location: acfFieldGroup.location,
				position: acfFieldGroup.position as
					| "normal"
					| "acf_after_title"
					| "side"
					| undefined,
				style: acfFieldGroup.style as "default" | "seamless" | undefined,
				labelPlacement: acfFieldGroup.label_placement as
					| "top"
					| "left"
					| undefined,
				description: acfFieldGroup.description,
			});

			// Return the field group and JSON
			return { fieldGroup };
		} catch (error) {
			console.error("Error processing field group:", error);
			return { fieldGroup: null };
		}
	},
});
