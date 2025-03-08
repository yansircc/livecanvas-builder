import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "HTML Preview",
	description: "Preview HTML template with Bootstrap",
};

export default function PreviewLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="preview-layout">{children}</div>;
}
