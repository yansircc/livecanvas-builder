import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export const metadata = {
	title: "LiveCanvas Gallery - 作品展示",
	description: "浏览、收藏和分享 LiveCanvas 社区创建的精美组件",
};

export default function GalleryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col">
			<MainNav />
			<main className="container mx-auto flex-1 px-6 py-12 dark:bg-zinc-950">
				{children}
			</main>
			<Footer />
		</div>
	);
}
