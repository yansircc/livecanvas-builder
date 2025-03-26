import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PreviewButtonProps {
	sessionId: number;
	versionId: number;
}

export function PreviewButton({ sessionId, versionId }: PreviewButtonProps) {
	const handleClick = () => {
		const url = `/preview?s=${sessionId}&v=${versionId}`;
		window.open(url, "_blank");
	};

	return (
		<Button variant="ghost" size="icon" onClick={handleClick}>
			<Eye className="h-4 w-4" />
		</Button>
	);
}
