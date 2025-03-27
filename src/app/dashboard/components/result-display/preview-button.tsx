import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PreviewButtonProps {
	dialogueId: number;
	submissionId: number;
}

export function PreviewButton({
	dialogueId,
	submissionId,
}: PreviewButtonProps) {
	const handleClick = () => {
		const url = `/preview?d=${dialogueId}&s=${submissionId}`;
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
