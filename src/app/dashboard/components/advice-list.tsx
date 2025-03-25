import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AdviceListProps {
	advices: string[];
	onAdviceClick: (advice: string) => void;
}

export function AdviceList({ advices, onAdviceClick }: AdviceListProps) {
	const handleAdviceKeyPress = (e: React.KeyboardEvent, advice: string) => {
		if (e.key === "Enter" || e.key === " ") {
			onAdviceClick(advice);
		}
	};

	if (!advices.length) return null;

	return (
		<div className="space-y-4">
			<h6 className="font-semibold">UI 建议</h6>
			<ul className="space-y-4">
				{advices.map((advice) => {
					if (!advice) return null;
					return (
						<li key={`advice-${advice}`} className="flex items-center gap-2">
							<Button
								onClick={() => onAdviceClick(advice)}
								onKeyDown={(e) => handleAdviceKeyPress(e, advice)}
								className="cursor-pointer rounded-md bg-muted p-3 text-left transition-colors hover:bg-primary/20"
								aria-label={`Apply advice: ${advice}`}
								variant="ghost"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<p className="flex-1 text-muted-foreground text-sm">{advice}</p>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
