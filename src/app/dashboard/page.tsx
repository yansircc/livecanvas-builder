import { getModelList } from "@/lib/models";
import { auth } from "@/server/auth";
import { addAuthCacheTags, addEdgeConfigCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import DialogueTabs from "./components/dialogue-tabs";
import { LlmForm } from "./components/llm-form";
import { LlmFormSkeleton } from "./components/llm-form/llm-form-skeleton";
import ResultDisplay from "./components/result-display";
import { ResultDisplaySkeleton } from "./components/result-display/result-display-skeleton";

async function getCachedFormData(sessionData: Session) {
	"use cache";

	addAuthCacheTags(sessionData.user.id);
	addEdgeConfigCacheTags();

	const modelList = await getModelList();
	return {
		sessionData,
		modelList,
	};
}

async function getCachedModelList() {
	"use cache";

	addEdgeConfigCacheTags();
	const modelList = await getModelList();
	return modelList;
}

async function SuspenseLlmForm() {
	const session = await auth();
	if (!session) {
		return null;
	}
	const { sessionData, modelList } = await getCachedFormData(session);
	return <LlmForm session={sessionData} modelList={modelList} />;
}

async function SuspenseResultDisplay() {
	const modelList = await getCachedModelList();
	return <ResultDisplay modelList={modelList} />;
}

export default function Dashboard() {
	return (
		<div className="container mx-auto flex flex-col gap-6 p-4">
			<DialogueTabs />

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
