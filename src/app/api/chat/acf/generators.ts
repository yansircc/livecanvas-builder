import {
	createGalleryField,
	createNumberField,
	createTextField,
	createTextareaField,
} from "./fields";
import type { ACFField } from "./schemas";

/**
 * Generate ACF fields configuration
 * This can be extended to include more field types as needed
 */
export function generateACFFields(): ACFField[] {
	const fields: ACFField[] = [
		createTextField({
			label: "Product Name",
			name: "product_name",
			required: 1,
		}),
		createTextareaField({
			label: "Product Description",
			name: "product_description",
		}),
		createNumberField({
			label: "Price",
			name: "product_price",
			min: 0,
		}),
		createGalleryField({
			label: "Product Gallery",
			name: "product_gallery",
		}),
	];

	return fields;
}
