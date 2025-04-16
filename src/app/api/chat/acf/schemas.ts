import { z } from "zod";
import {
	type ACFFieldInterface,
	acfBaseFieldSchema,
	acfFieldTypeEnum,
	locationRuleSchema,
} from "./types";

// Define base type for recursive references
type ACFBaseField = z.infer<typeof acfBaseFieldSchema>;

// Text field specific properties
export const acfTextFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("text"),
		default_value: z
			.string()
			.optional()
			.describe("Default value for the field"),
		maxlength: z.string().optional().describe("Maximum character length"),
		placeholder: z.string().optional().describe("Placeholder text"),
		prepend: z.string().optional().describe("Text to prepend before the input"),
		append: z.string().optional().describe("Text to append after the input"),
	})
	.describe("Text field properties");

// Textarea field specific properties
export const acfTextareaFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("textarea"),
		default_value: z
			.string()
			.optional()
			.describe("Default value for the field"),
		placeholder: z.string().optional().describe("Placeholder text"),
		maxlength: z.string().optional().describe("Maximum character length"),
		rows: z.number().optional().describe("Number of rows in the textarea"),
		new_lines: z
			.enum(["wpautop", "br", ""])
			.optional()
			.describe("How new lines are rendered"),
	})
	.describe("Textarea field properties");

// Number field specific properties
export const acfNumberFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("number"),
		default_value: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Default value for the field"),
		placeholder: z.string().optional().describe("Placeholder text"),
		min: z.union([z.string(), z.number()]).optional().describe("Minimum value"),
		max: z.union([z.string(), z.number()]).optional().describe("Maximum value"),
		step: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Step size for value adjustment"),
	})
	.describe("Number field properties");

// Image field specific properties
export const acfImageFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("image"),
		return_format: z
			.enum(["array", "url", "id"])
			.optional()
			.describe("Format to return the image data"),
		preview_size: z.string().optional().describe("Size of the image preview"),
		library: z
			.enum(["all", "uploadedTo"])
			.optional()
			.describe("Limits the library to only show images uploaded to this post"),
		min_width: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum image width in pixels"),
		min_height: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum image height in pixels"),
		min_size: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum file size in bytes"),
		max_width: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum image width in pixels"),
		max_height: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum image height in pixels"),
		max_size: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum file size in bytes"),
		mime_types: z.string().optional().describe("Allowed file types"),
	})
	.describe("Image field properties");

// Gallery field specific properties
export const acfGalleryFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("gallery"),
		return_format: z
			.enum(["array", "url", "id"])
			.optional()
			.describe("Format to return the gallery data"),
		preview_size: z.string().optional().describe("Size of the image preview"),
		library: z
			.enum(["all", "uploadedTo"])
			.optional()
			.describe("Limits the library to only show images uploaded to this post"),
		min: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum number of images"),
		max: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum number of images"),
		min_width: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum image width in pixels"),
		min_height: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum image height in pixels"),
		min_size: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Minimum file size in bytes"),
		max_width: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum image width in pixels"),
		max_height: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum image height in pixels"),
		max_size: z
			.union([z.string(), z.number()])
			.optional()
			.describe("Maximum file size in bytes"),
		mime_types: z.string().optional().describe("Allowed file types"),
		insert: z
			.enum(["append", "prepend"])
			.optional()
			.describe("Insert position for new images"),
	})
	.describe("Gallery field properties");

// Select field specific properties
export const acfSelectFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("select"),
		choices: z
			.record(z.string(), z.string())
			.optional()
			.describe("Available choices"),
		default_value: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.describe("Default selected value(s)"),
		allow_null: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Allow no selection"),
		multiple: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Allow multiple selections"),
		ui: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Use enhanced UI"),
		ajax: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Load choices via AJAX"),
		return_format: z
			.enum(["value", "label", "array"])
			.optional()
			.describe("Format to return the selected value"),
		placeholder: z.string().optional().describe("Placeholder text"),
	})
	.describe("Select field properties");

// WYSIWYG field specific properties
export const acfWysiwygFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("wysiwyg"),
		default_value: z.string().optional().describe("Default content"),
		tabs: z
			.enum(["all", "visual", "text"])
			.optional()
			.describe("Available editing tabs"),
		toolbar: z
			.enum(["full", "basic"])
			.optional()
			.describe("Toolbar configuration"),
		media_upload: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Allow media uploads"),
		delay: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Delay initialization until field is visible"),
	})
	.describe("WYSIWYG editor field properties");

// True/False field specific properties
export const acfTrueFalseFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("true_false"),
		default_value: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Default state"),
		ui: z.union([z.number(), z.boolean()]).optional().describe("Use toggle UI"),
		ui_on_text: z
			.string()
			.optional()
			.describe("Text displayed when toggle is on"),
		ui_off_text: z
			.string()
			.optional()
			.describe("Text displayed when toggle is off"),
	})
	.describe("True/False toggle field properties");

// Date Picker field specific properties
export const acfDatePickerFieldSchema = acfBaseFieldSchema
	.extend({
		type: z.literal("date_picker"),
		display_format: z
			.string()
			.optional()
			.describe("Date format displayed to the user"),
		return_format: z
			.string()
			.optional()
			.describe("Date format returned to the database"),
		first_day: z
			.number()
			.optional()
			.describe("First day of the week (0 = Sunday)"),
	})
	.describe("Date picker field properties");

// Define a simplified field schema type that matches ACFFieldInterface
export type ACFFieldSchema = ACFFieldInterface & {
	sub_fields?: ACFFieldSchema[];
};

// Define an internal union type for all possible field types
type ACFAllFieldTypes =
	| z.infer<typeof acfTextFieldSchema>
	| z.infer<typeof acfTextareaFieldSchema>
	| z.infer<typeof acfNumberFieldSchema>
	| z.infer<typeof acfImageFieldSchema>
	| z.infer<typeof acfGalleryFieldSchema>
	| z.infer<typeof acfSelectFieldSchema>
	| z.infer<typeof acfWysiwygFieldSchema>
	| z.infer<typeof acfTrueFalseFieldSchema>
	| z.infer<typeof acfDatePickerFieldSchema>
	| ACFRepeaterField;

// Define repeater schema type before creating it
interface ACFRepeaterField extends ACFBaseField {
	type: "repeater";
	sub_fields: Array<ACFAllFieldTypes>;
	min?: string | number;
	max?: string | number;
	layout?: "table" | "block" | "row";
	button_label?: string;
	collapsed?: string;
}

// Add explicit type annotation
export const acfRepeaterFieldSchema: z.ZodType<ACFRepeaterField> =
	acfBaseFieldSchema
		.extend({
			type: z.literal("repeater"),
			sub_fields: z.lazy(
				(): z.ZodType<Array<ACFAllFieldTypes>> => z.array(acfFieldSchema),
			),
			min: z
				.union([z.string(), z.number()])
				.optional()
				.describe("Minimum number of rows"),
			max: z
				.union([z.string(), z.number()])
				.optional()
				.describe("Maximum number of rows"),
			layout: z
				.enum(["table", "block", "row"])
				.optional()
				.describe("Layout of the repeater"),
			button_label: z
				.string()
				.optional()
				.describe("Label for the 'Add Row' button"),
			collapsed: z
				.string()
				.optional()
				.describe("Field key to collapse repeater rows by"),
		})
		.describe("Repeater field properties");

// Add explicit type annotation
export const acfFieldSchema: z.ZodType<ACFAllFieldTypes> = z.union([
	acfTextFieldSchema,
	acfTextareaFieldSchema,
	acfNumberFieldSchema,
	acfImageFieldSchema,
	acfGalleryFieldSchema,
	acfSelectFieldSchema,
	acfWysiwygFieldSchema,
	acfTrueFalseFieldSchema,
	acfDatePickerFieldSchema,
	acfRepeaterFieldSchema,
]);

// Export final ACFField type
export type ACFField = z.infer<typeof acfFieldSchema>;

// Field Group schema for ACF import format
export const acfFieldGroupSchema = z
	.object({
		key: z
			.string()
			.describe(
				"Unique identifier for the field group, must be English and lowercase",
			),
		title: z
			.string()
			.describe("Title of the field group displayed in the admin UI"),
		fields: z.array(acfFieldSchema).describe("Array of fields in this group"),
		location: z
			.array(z.array(locationRuleSchema))
			.describe("Rules for where to display these fields"),
		menu_order: z.number().optional().describe("Order of the field group"),
		position: z.string().optional().describe("Position on the edit screen"),
		style: z.string().optional().describe("Style of the field group"),
		label_placement: z.string().optional().describe("Position of field labels"),
		instruction_placement: z
			.string()
			.optional()
			.describe("Position of field instructions"),
		hide_on_screen: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.describe("Elements to hide on screen"),
		active: z
			.boolean()
			.optional()
			.describe("Whether the field group is active"),
		description: z
			.string()
			.optional()
			.describe("Description of the field group"),
		show_in_rest: z
			.union([z.number(), z.boolean()])
			.optional()
			.describe("Whether to show in REST API"),
	})
	.describe("ACF Field Group for import");

// Define the type for TypeScript usage
export type ACFFieldGroup = z.infer<typeof acfFieldGroupSchema>;
