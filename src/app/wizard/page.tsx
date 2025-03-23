import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { ThemeGenerator } from "./components/theme-generator";

export default function WizardV2() {
	return (
		<div className="flex min-h-screen flex-col">
			<MainNav />
			<div className="container mx-auto flex-1 py-8">
				<ThemeGenerator />
			</div>
			<Footer />
		</div>
	);
}
