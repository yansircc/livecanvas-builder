import { Suspense } from "react";
import { SuspenseComponent } from "./suspense";

export default async function ProtectedPage() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<SuspenseComponent />
		</Suspense>
	);
}
