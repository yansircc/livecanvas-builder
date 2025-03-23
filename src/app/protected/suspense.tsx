import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getCachedSessionData } from "./actions";

/**
 * 异步组件
 * @returns 返回主UI
 */
export async function SuspenseComponent() {
	const sessionData = await auth();
	const session = await getCachedSessionData(sessionData);

	if (!session) {
		redirect("/login");
	}
	return (
		<div className="p-6">
			<h1 className="mb-4 font-bold text-2xl">Protected Page</h1>
			<p className="mb-2">You are logged in as:</p>
			<pre className="rounded bg-gray-100 p-4">
				{JSON.stringify(session, null, 2)}
			</pre>
		</div>
	);
}
