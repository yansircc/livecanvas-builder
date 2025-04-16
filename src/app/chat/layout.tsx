import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export const metadata = {
	title: "LiveCanvas Chat - 与 LiveCanvas 对话",
	description: "与 LiveCanvas 对话，获取有关 ACF 字段和 LNL 代码的帮助",
};

export default function ChatLayout({
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
