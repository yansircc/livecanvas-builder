import type { ACFField, ACFFieldGroup } from "./schemas";
import { generateGroupKey } from "./utils";

/**
 * Create an ACF field group with the provided fields
 * This format is compatible with ACF's import/export feature
 */
export function createFieldGroup(options: {
	title: string;
	fields: ACFField[];
	location?: Array<Array<{ param: string; operator: string; value: string }>>;
	key?: string;
	position?: "acf_after_title" | "normal" | "side";
	style?: "default" | "seamless";
	labelPlacement?: "top" | "left";
	instructionPlacement?: "label" | "field";
	description?: string;
}): ACFFieldGroup {
	const defaultLocation = [
		[
			{
				param: "post_type",
				operator: "==",
				value: "post",
			},
		],
	];

	// Generate group key based on sanitized title if not provided
	const groupKey =
		options.key ||
		generateGroupKey(options.title.toLowerCase().replace(/\s+/g, "_"));

	return {
		key: groupKey,
		title: options.title,
		fields: options.fields,
		location: options.location || defaultLocation,
		menu_order: 0,
		position: options.position || "normal",
		style: options.style || "default",
		label_placement: options.labelPlacement || "top",
		instruction_placement: options.instructionPlacement || "label",
		hide_on_screen: "",
		active: true,
		description: options.description || "",
		show_in_rest: 0,
	};
}

/**
 * Create a complete ACF field group JSON for import
 */
export function generateACFFieldGroupJSON(options: {
	title: string;
	fields: ACFField[];
	postType?: string;
	key?: string;
	position?: "acf_after_title" | "normal" | "side";
	style?: "default" | "seamless";
	description?: string;
}): string {
	// Set up location based on post type if provided
	let location:
		| Array<Array<{ param: string; operator: string; value: string }>>
		| undefined;
	if (options.postType) {
		location = [
			[
				{
					param: "post_type",
					operator: "==",
					value: options.postType,
				},
			],
		];
	}

	const fieldGroup = createFieldGroup({
		title: options.title,
		fields: options.fields,
		location: location,
		key: options.key,
		position: options.position,
		style: options.style,
		description: options.description,
	});

	// Wrap in array for ACF import format
	return JSON.stringify([fieldGroup], null, 2);
}
