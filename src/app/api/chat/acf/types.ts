import { z } from "zod";

// ACF field types as a Zod enum
export const acfFieldTypeEnum = z
	.enum([
		"text",
		"textarea",
		"number",
		"range",
		"email",
		"url",
		"password",
		"image",
		"file",
		"wysiwyg",
		"oembed",
		"gallery",
		"select",
		"checkbox",
		"radio",
		"button_group",
		"true_false",
		"link",
		"post_object",
		"page_link",
		"relationship",
		"taxonomy",
		"user",
		"google_map",
		"date_picker",
		"date_time_picker",
		"time_picker",
		"color_picker",
		"message",
		"accordion",
		"tab",
		"group",
		"repeater",
		"flexible_content",
	])
	.describe("ACF field type");

// Extract the type for TypeScript usage
export type ACFFieldType = z.infer<typeof acfFieldTypeEnum>;

// Base wrapper schema
export const wrapperSchema = z
	.object({
		width: z.string().optional().describe("Width of the field in the admin UI"),
		class: z
			.string()
			.optional()
			.describe("CSS class for the field in the admin UI"),
		id: z.string().optional().describe("HTML ID for the field in the admin UI"),
	})
	.describe("Field wrapper settings");

// Base properties for all ACF fields
export const acfBaseFieldSchema = z
	.object({
		key: z.string().describe("Unique identifier for the field"),
		label: z.string().describe("Label displayed in the admin UI"),
		name: z
			.string()
			.describe("Name used to save and retrieve data from the database"),
		"aria-label": z.string().optional().describe("Accessibility label"),
		type: acfFieldTypeEnum,
		instructions: z
			.string()
			.optional()
			.describe("Instructions for authors displayed in the admin UI"),
		required: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Whether this field is required"),
		conditional_logic: z
			.union([z.boolean(), z.number(), z.record(z.unknown())])
			.optional()
			.describe("Rules for conditionally showing/hiding the field"),
		wrapper: wrapperSchema.optional(),
	})
	.describe("Base ACF field properties");

// Location rule schema for ACF field groups
export const locationRuleSchema = z.object({
	param: z.string().describe("Parameter to check (e.g., post_type)"),
	operator: z.string().describe("Comparison operator"),
	value: z.string().describe("Value to compare against"),
});

// Field option types for additional type safety when creating fields
export interface FieldOptions {
	type: ACFFieldType;
	label: string;
	name: string;
	instructions?: string;
	required?: number | boolean;
	options?: Record<string, unknown>;
	choices?: Record<string, string>;
	sub_fields?: FieldOptions[];

	// Common optional properties
	default_value?: string | number | boolean | string[];
	placeholder?: string;

	// Image/gallery specific
	return_format?: string;
	preview_size?: string;
	library?: string;

	// Repeater specific
	min?: string | number;
	max?: string | number;
	layout?: "table" | "block" | "row";
	button_label?: string;
}

// Simple ACF field interface for use outside of Zod context
export interface ACFFieldInterface {
	key: string;
	label: string;
	name: string;
	type: ACFFieldType;
	instructions?: string;
	required?: number | boolean;
	[key: string]: unknown;
}
