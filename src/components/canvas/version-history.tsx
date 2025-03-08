import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Version, useAppStore } from "@/store/use-app-store";
import { formatDistanceToNow } from "date-fns";
import { Eye, GitBranch } from "lucide-react";

export function VersionHistory() {
	const { versions, currentVersionIndex, switchToVersion } = useAppStore();

	if (versions.length === 0) {
		return null;
	}

	const openPreview = (versionIndex: number) => {
		const version = versions[versionIndex];
		if (version) {
			const contentId = version.id;
			localStorage.setItem(`preview_content_${contentId}`, version.code || "");
			window.open(`/preview?id=${contentId}`, "_blank");
		}
	};

	// Create a map of versions by ID for easy lookup
	const versionsMap = new Map();
	for (const version of versions) {
		versionsMap.set(version.id, version);
	}

	// Group versions by their parent-child relationships
	const getVersionLevel = (version: Version) => {
		let level = 0;
		let current = version;
		while (current?.parentId) {
			level++;
			current = versionsMap.get(current.parentId);
		}
		return level;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Version History</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 p-4 pt-0 max-h-[300px] overflow-y-auto">
				{versions.map((version, index) => {
					const level = getVersionLevel(version);

					return (
						<div
							key={version.id}
							className={`p-3 rounded-md flex justify-between items-center ${
								index === currentVersionIndex
									? "bg-primary/10 border border-primary/20"
									: ""
							}`}
							style={{
								marginLeft: level > 0 ? `${level * 10}px` : "0",
							}}
						>
							{level > 0 && (
								<GitBranch className="h-3 w-3 text-muted-foreground mr-2 flex-shrink-0" />
							)}
							<Button
								variant="ghost"
								className="flex-1 h-auto p-0 justify-start text-left"
								onClick={() => switchToVersion(index)}
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<div className="font-medium truncate max-w-[180px]">
											{version.prompt}
										</div>
										{index === currentVersionIndex && (
											<span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
												Active
											</span>
										)}
									</div>
									<div className="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(version.timestamp), {
											addSuffix: true,
										})}
									</div>
								</div>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => openPreview(index)}
								title="Preview this version"
								type="button"
							>
								<Eye className="h-4 w-4" />
							</Button>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
