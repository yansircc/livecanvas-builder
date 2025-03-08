import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/use-app-store";

export function VersionSelector() {
	const { versions, currentVersionIndex, switchToVersion } = useAppStore();

	if (versions.length <= 1) {
		return null; // Only show selector when we have multiple versions
	}

	return (
		<Select
			value={currentVersionIndex.toString()}
			onValueChange={(value) => switchToVersion(Number.parseInt(value))}
		>
			<SelectTrigger className="h-8">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
			<SelectContent>
				{versions.map((version, index) => (
					<SelectItem key={version.id} value={index.toString()}>
						<span>v{index + 1}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
