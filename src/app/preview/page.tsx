import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Suspense } from "react";
import { LoadingSpinner } from "./components/loading-spinner";
import { PreviewContent } from "./components/preview-content";

// Must use this wrapper function since the auth session data is not cached by default
async function getCachedSessionData(sessionData: Session | null) {
	"use cache";
	cacheTag("auth");

	// Simulate a loading delay
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}

const SuspensePreviewContent = async () => {
	const sessionData = await auth();
	const session = await getCachedSessionData(sessionData);

	return <PreviewContent session={session} />;
};

export default function PreviewPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<MainNav />
			<Suspense fallback={<LoadingSpinner />}>
				<SuspensePreviewContent />
			</Suspense>
			<Footer />
		</div>
	);
}
