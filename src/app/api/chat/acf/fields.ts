import type { z } from "zod";
import type {
	GalleryFieldOptions,
	ImageFieldOptions,
	NumberFieldOptions,
	RepeaterFieldOptions,
	SelectFieldOptions,
	TextFieldOptions,
	TextareaFieldOptions,
} from "./options";
import {
	galleryFieldOptionsSchema,
	imageFieldOptionsSchema,
	numberFieldOptionsSchema,
	repeaterFieldOptionsSchema,
	selectFieldOptionsSchema,
	textFieldOptionsSchema,
	textareaFieldOptionsSchema,
} from "./options";
import type {
	acfGalleryFieldSchema,
	acfImageFieldSchema,
	acfNumberFieldSchema,
	acfRepeaterFieldSchema,
	acfSelectFieldSchema,
	acfTextFieldSchema,
	acfTextareaFieldSchema,
} from "./schemas";
import type { acfFieldSchema } from "./schemas";
import { generateFieldKey } from "./utils";

/**
 * Create an ACF text field
 */
export function createTextField(
	options: TextFieldOptions,
): z.infer<typeof acfTextFieldSchema> {
	const validatedOptions = textFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "text",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		default_value: validatedOptions.default_value || "",
		maxlength: validatedOptions.maxlength || "",
		placeholder: validatedOptions.placeholder || "",
		prepend: validatedOptions.prepend || "",
		append: validatedOptions.append || "",
	};
}

/**
 * Create an ACF textarea field
 */
export function createTextareaField(
	options: TextareaFieldOptions,
): z.infer<typeof acfTextareaFieldSchema> {
	const validatedOptions = textareaFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "textarea",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		default_value: validatedOptions.default_value || "",
		placeholder: validatedOptions.placeholder || "",
		maxlength: validatedOptions.maxlength || "",
		rows: validatedOptions.rows || 4,
		new_lines: validatedOptions.new_lines || "wpautop",
	};
}

/**
 * Create an ACF number field
 */
export function createNumberField(
	options: NumberFieldOptions,
): z.infer<typeof acfNumberFieldSchema> {
	const validatedOptions = numberFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "number",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		default_value: validatedOptions.default_value || "",
		placeholder: validatedOptions.placeholder || "",
		min: validatedOptions.min || "",
		max: validatedOptions.max || "",
		step: validatedOptions.step || "1",
	};
}

/**
 * Create an ACF gallery field
 */
export function createGalleryField(
	options: GalleryFieldOptions,
): z.infer<typeof acfGalleryFieldSchema> {
	const validatedOptions = galleryFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "gallery",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		return_format: validatedOptions.return_format || "array",
		library: validatedOptions.library || "all",
		min: validatedOptions.min || "",
		max: validatedOptions.max || "",
		min_width: validatedOptions.min_width || "",
		min_height: validatedOptions.min_height || "",
		min_size: validatedOptions.min_size || "",
		max_width: validatedOptions.max_width || "",
		max_height: validatedOptions.max_height || "",
		max_size: validatedOptions.max_size || "",
		mime_types: validatedOptions.mime_types || "",
		insert: validatedOptions.insert || "append",
		preview_size: validatedOptions.preview_size || "medium",
	};
}

/**
 * Create an ACF image field
 */
export function createImageField(
	options: ImageFieldOptions,
): z.infer<typeof acfImageFieldSchema> {
	const validatedOptions = imageFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "image",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		return_format: validatedOptions.return_format || "array",
		preview_size: validatedOptions.preview_size || "medium",
		library: validatedOptions.library || "all",
		min_width: validatedOptions.min_width || "",
		min_height: validatedOptions.min_height || "",
		min_size: validatedOptions.min_size || "",
		max_width: validatedOptions.max_width || "",
		max_height: validatedOptions.max_height || "",
		max_size: validatedOptions.max_size || "",
		mime_types: validatedOptions.mime_types || "",
	};
}

/**
 * Create an ACF select field
 */
export function createSelectField(
	options: SelectFieldOptions,
): z.infer<typeof acfSelectFieldSchema> {
	const validatedOptions = selectFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "select",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		choices: validatedOptions.choices || {},
		default_value: validatedOptions.default_value || "",
		allow_null: validatedOptions.allow_null ?? 0,
		multiple: validatedOptions.multiple ?? 0,
		ui: validatedOptions.ui ?? 0,
		ajax: validatedOptions.ajax ?? 0,
		return_format: validatedOptions.return_format || "value",
		placeholder: validatedOptions.placeholder || "",
	};
}

/**
 * Create an ACF repeater field
 */
export function createRepeaterField(
	options: RepeaterFieldOptions,
): z.infer<typeof acfRepeaterFieldSchema> {
	const validatedOptions = repeaterFieldOptionsSchema.parse(options);

	return {
		key: validatedOptions.key || generateFieldKey(validatedOptions.name),
		type: "repeater",
		label: validatedOptions.label,
		name: validatedOptions.name,
		"aria-label": validatedOptions["aria-label"] || "",
		instructions: validatedOptions.instructions || "",
		required: validatedOptions.required ?? 0,
		conditional_logic: validatedOptions.conditional_logic || 0,
		wrapper: validatedOptions.wrapper || {
			width: "",
			class: "",
			id: "",
		},
		sub_fields: (validatedOptions.sub_fields || []) as z.infer<
			typeof acfFieldSchema
		>[],
		min: validatedOptions.min || "",
		max: validatedOptions.max || "",
		layout: validatedOptions.layout || "table",
		button_label: validatedOptions.button_label || "Add Row",
		collapsed: validatedOptions.collapsed || "",
	};
}
