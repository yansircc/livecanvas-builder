/**
 * Optimized loading component with reduced rendering complexity
 * Uses reduced DOM elements for better performance
 */
export function GalleryLoading() {
	return (
		<div
			className="flex h-64 items-center justify-center"
			aria-label="Loading gallery content"
		>
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-500" />
		</div>
	);
}
