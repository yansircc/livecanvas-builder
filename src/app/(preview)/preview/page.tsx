"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "./components/loading-spinner";
import { PreviewContent } from "./components/preview-content";

// Main page component with Suspense boundary
export default function PreviewPage() {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<PreviewContent />
		</Suspense>
	);
}
