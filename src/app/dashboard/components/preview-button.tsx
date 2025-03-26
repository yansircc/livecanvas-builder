import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PreviewButtonProps {
	dialogueId: number;
	versionId: number;
}

export function PreviewButton({ dialogueId, versionId }: PreviewButtonProps) {
	const handleClick = () => {
		const url = `/preview?d=${dialogueId}&v=${versionId}`;
		window.open(url, "_blank");
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleClick}
			className="cursor-pointer"
		>
			<Eye className="h-4 w-4" />
		</Button>
	);
}
