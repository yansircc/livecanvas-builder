import { getModelList } from "@/lib/models";
import { auth } from "@/server/auth";
import { addAuthCacheTags, addEdgeConfigCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { LlmForm } from "./components/llm-form";
import { LlmFormSkeleton } from "./components/llm-form-skeleton";
import ResultDisplay from "./components/result-display";
import { ResultDisplaySkeleton } from "./components/result-display-skeleton";
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
					<Suspense fallback={<LlmFormSkeleton />}>
						<SuspenseLlmForm />
					</Suspense>
				</div>
				<Suspense fallback={<ResultDisplaySkeleton />}>
					<SuspenseResultDisplay />
				</Suspense>
			</div>
		</div>
	);
}
