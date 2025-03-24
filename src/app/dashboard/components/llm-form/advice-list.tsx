import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdviceListProps {
	adviceItems: string[];
	versionId?: number | null;
	onAdviceClick: (advice: string) => void;
}

export function AdviceList({
	adviceItems,
	versionId,
	onAdviceClick,
}: AdviceListProps) {
	if (adviceItems.length === 0) return null;

	return (
		<Card className="mt-4">
			<CardContent className="pt-4">
				<h3 className="mb-2 font-medium text-sm">
					Advice (click to add to prompt)
				</h3>
				<div className="space-y-2">
					{adviceItems.map((advice) => (
						<Button
							key={`advice-${versionId}-${advice}`}
							variant="outline"
							className="h-auto w-full justify-start p-2 text-left font-normal text-sm"
							onClick={() => onAdviceClick(advice)}
						>
							{advice}
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
