import { z } from "zod";
import {
	acfGalleryFieldSchema,
	acfImageFieldSchema,
	acfNumberFieldSchema,
	acfSelectFieldSchema,
	acfTextFieldSchema,
	acfTextareaFieldSchema,
} from "./schemas";
import type { ACFField } from "./schemas";
import { wrapperSchema } from "./types";

// Input options types for the creation functions
export const textFieldOptionsSchema = acfTextFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type TextFieldOptions = z.infer<typeof textFieldOptionsSchema>;

export const textareaFieldOptionsSchema = acfTextareaFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type TextareaFieldOptions = z.infer<typeof textareaFieldOptionsSchema>;

export const numberFieldOptionsSchema = acfNumberFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type NumberFieldOptions = z.infer<typeof numberFieldOptionsSchema>;

export const galleryFieldOptionsSchema = acfGalleryFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type GalleryFieldOptions = z.infer<typeof galleryFieldOptionsSchema>;

export const imageFieldOptionsSchema = acfImageFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type ImageFieldOptions = z.infer<typeof imageFieldOptionsSchema>;

export const selectFieldOptionsSchema = acfSelectFieldSchema
	.omit({ type: true })
	.partial()
	.extend({
		label: z.string(),
		name: z.string(),
		key: z.string().optional(),
	});
export type SelectFieldOptions = z.infer<typeof selectFieldOptionsSchema>;

// Options for repeater fields
export interface RepeaterFieldOptions {
	key?: string;
	label: string;
	name: string;
	"aria-label"?: string;
	instructions?: string;
	required?: number | boolean;
	conditional_logic?: number | boolean | Record<string, unknown>;
	wrapper?: z.infer<typeof wrapperSchema>;
	sub_fields?: ACFField[];
	min?: string | number;
	max?: string | number;
	layout?: "table" | "block" | "row";
	button_label?: string;
	collapsed?: string;
}

// Schema for validating repeater field options
export const repeaterFieldOptionsSchema = z.object({
	key: z.string().optional(),
	label: z.string(),
	name: z.string(),
	"aria-label": z.string().optional(),
	instructions: z.string().optional(),
	required: z.union([z.number(), z.boolean()]).optional(),
	conditional_logic: z
		.union([z.boolean(), z.number(), z.record(z.unknown())])
		.optional(),
	wrapper: wrapperSchema.optional(),
	sub_fields: z.array(z.unknown()).optional(),
	min: z.union([z.string(), z.number()]).optional(),
	max: z.union([z.string(), z.number()]).optional(),
	layout: z.enum(["table", "block", "row"]).optional(),
	button_label: z.string().optional(),
	collapsed: z.string().optional(),
});
