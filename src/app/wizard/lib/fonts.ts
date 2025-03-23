// Available font options for the theme generator
export const FONT_OPTIONS = {
	heading: [
		"Inter",
		"Roboto",
		"Open Sans",
		"Montserrat",
		"Poppins",
		"Raleway",
		"Playfair Display",
		"Merriweather",
		"Oswald",
	],
	body: [
		"Inter",
		"Roboto",
		"Open Sans",
		"Lato",
		"Source Sans Pro",
		"Nunito",
		"Roboto Slab",
		"Rubik",
	],
	mono: [
		"Fira Code",
		"JetBrains Mono",
		"Source Code Pro",
		"IBM Plex Mono",
		"Roboto Mono",
		"Ubuntu Mono",
		"Inconsolata",
	],
};

// UI element size options
export const UI_SIZES = {
	compact: "Compact",
	default: "Default",
	spacious: "Spacious",
};

// Border radius options
export const BORDER_RADII = [
	{ value: "none", label: "None", css: "0px" },
	{ value: "sm", label: "Small", css: "0.125rem" },
	{ value: "md", label: "Medium", css: "0.375rem" },
	{ value: "lg", label: "Large", css: "0.5rem" },
	{ value: "xl", label: "Extra Large", css: "0.75rem" },
	{ value: "full", label: "Full", css: "9999px" },
];

// Border width options
export const BORDER_WIDTHS = [
	{ value: "none", label: "None", css: "0px" },
	{ value: "thin", label: "Thin", css: "1px" },
	{ value: "medium", label: "Medium", css: "2px" },
	{ value: "thick", label: "Thick", css: "3px" },
];
