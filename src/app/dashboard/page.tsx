import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import LlmForm from "./components/llm-form";
import ResultDisplay from "./components/result-display";
import SessionTabs from "./components/session-tabs";

async function getCachedSessionData(sessionData: Session) {
	"use cache";
	addAuthCacheTags(sessionData.user.id);

	// Simulate a loading delay
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}

async function SuspenseLlmForm() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);
	return <LlmForm session={session} />;
}

export default function Dashboard() {
	return (
		<div className="container mx-auto space-y-4 p-4">
			<SessionTabs />

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-4">
					<Suspense fallback={<div>Loading...</div>}>
						<SuspenseLlmForm />
					</Suspense>
				</div>
				<ResultDisplay />
			</div>
		</div>
	);
}
