"use client";

import { Badge } from "@/components/ui/badge";

interface GalleryHeaderProps {
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
	availableTags: string[];
}

export function GalleryHeader({
	selectedTags,
	setSelectedTags,
	availableTags,
}: GalleryHeaderProps) {
	// Toggle tag handler - memoized
	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	// Clear all tags handler
	const clearTags = () => setSelectedTags([]);

	return (
		<div className="mt-4">
			<div className="flex flex-wrap items-center gap-2">
				{availableTags.map((tag) => {
					const isSelected = selectedTags.includes(tag);
					return (
						<Badge
							key={tag}
							variant={isSelected ? "default" : "outline"}
							className={`cursor-pointer transition-colors ${
								isSelected
									? "hover:bg-primary/90 dark:hover:bg-primary/90" // Darker hover color for selected tags
									: "hover:bg-zinc-100 dark:hover:bg-zinc-800" // Light hover color for unselected tags
							}`}
							onClick={() => toggleTag(tag)}
						>
							{tag}
						</Badge>
					);
				})}

				{selectedTags.length > 0 && (
					<button
						type="button"
						className="ml-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
						onClick={clearTags}
					>
						Clear all
					</button>
				)}
			</div>
		</div>
	);
}
