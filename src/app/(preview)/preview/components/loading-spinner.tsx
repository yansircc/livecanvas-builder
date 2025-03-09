export function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent" />
		</div>
	);
}
