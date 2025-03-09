import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

// Define fonts
const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const playfair = Playfair_Display({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-playfair",
});

export const metadata: Metadata = {
	title: "HTML Preview",
	description: "Preview HTML template with Bootstrap",
};

export default function PreviewLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div
			className={`preview-layout ${inter.variable} ${playfair.variable} font-sans`}
		>
			{children}
		</div>
	);
}
