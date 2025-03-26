import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export const metadata = {
	title: "LiveCanvas Builder - 作品预览",
	description: "预览 LiveCanvas Builder 生成的作品",
};

export default function GalleryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
			<MainNav />
			<main className="container mx-auto flex-1 px-6 py-12">{children}</main>
			<Footer />
		</div>
	);
}
