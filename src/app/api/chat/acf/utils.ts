import {
	acfDatePickerFieldSchema,
	acfFieldSchema,
	acfGalleryFieldSchema,
	acfImageFieldSchema,
	acfNumberFieldSchema,
	acfSelectFieldSchema,
	acfTextFieldSchema,
	acfTextareaFieldSchema,
	acfTrueFalseFieldSchema,
	acfWysiwygFieldSchema,
} from "./schemas";
import type { ACFFieldType } from "./types";

/**
 * Generate a unique field key if none is provided
 */
export function generateFieldKey(name: string): string {
	const randomPart = Math.random().toString(36).substring(2, 10);
	return `field_${name}_${randomPart}`;
}

/**
 * Generate a unique group key
 */
export function generateGroupKey(name: string): string {
	const randomPart = Math.random().toString(36).substring(2, 10);
	return `group_${name}_${randomPart}`;
}

/**
 * Get Zod schema for a specific ACF field type
 */
export function getFieldSchema(type: ACFFieldType) {
	switch (type) {
		case "text":
			return acfTextFieldSchema;
		case "textarea":
			return acfTextareaFieldSchema;
		case "number":
			return acfNumberFieldSchema;
		case "gallery":
			return acfGalleryFieldSchema;
		case "image":
			return acfImageFieldSchema;
		case "select":
			return acfSelectFieldSchema;
		case "wysiwyg":
			return acfWysiwygFieldSchema;
		case "true_false":
			return acfTrueFalseFieldSchema;
		case "date_picker":
			return acfDatePickerFieldSchema;
		default:
			return acfFieldSchema;
	}
}
