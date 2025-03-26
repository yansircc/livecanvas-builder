import DialogueProvider from "@/app/dashboard/components/dialogue-provider";
import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DialogueProvider>
			<main className="flex min-h-screen flex-col gap-8">
				<MainNav />
				<div className="flex-grow">{children}</div>
				<Footer className="mt-auto" />
			</main>
		</DialogueProvider>
	);
}
