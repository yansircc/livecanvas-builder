import { getModelList } from "@/lib/models";
import { auth } from "@/server/auth";
import { addAuthCacheTags, addEdgeConfigCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { LlmForm } from "./components/llm-form";
import ResultDisplay from "./components/result-display";
import SessionTabs from "./components/session-tabs";

async function getCachedSessionData(sessionData: Session) {
	"use cache";

	addAuthCacheTags(sessionData.user.id);
	return sessionData;
}

async function getCachedModelList() {
	"use cache";

	addEdgeConfigCacheTags();
	const modelList = await getModelList();
	return modelList;
}

async function SuspenseLlmForm() {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}
	const session = await getCachedSessionData(sessionData);
	const modelList = await getCachedModelList();
	return <LlmForm session={session} modelList={modelList} />;
}

async function SuspenseResultDisplay() {
	const modelList = await getCachedModelList();
	return <ResultDisplay modelList={modelList} />;
}

export default function Dashboard() {
	return (
		<div className="container mx-auto flex flex-col gap-6 p-4">
			<SessionTabs />

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-4">
					<Suspense fallback={<div>Loading...</div>}>
						<SuspenseLlmForm />
					</Suspense>
				</div>
				<Suspense fallback={<div>Loading...</div>}>
					<SuspenseResultDisplay />
				</Suspense>
			</div>
		</div>
	);
}
