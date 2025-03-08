"use client";

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
		<div className="rounded-lg border bg-card text-card-foreground shadow">
			<div className="p-6 space-y-4">
				<h2 className="text-2xl font-semibold">UI Advice</h2>
				<div className="space-y-2">
					{advices.map((advice) => {
						if (!advice) return null;
						return (
							<button
								key={`advice-${advice}`}
								onClick={() => onAdviceClick(advice)}
								onKeyDown={(e) => handleAdviceKeyPress(e, advice)}
								className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
								type="button"
								aria-label={`Apply advice: ${advice}`}
							>
								{advice}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
