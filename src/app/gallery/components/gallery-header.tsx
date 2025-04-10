"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGalleryLoading } from "./gallery-loading-provider";

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
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isInitialized, setIsInitialized] = useState(false);
	const [paramObject, setParamObject] = useState<{
		tagList: string[];
		paramString: string;
	}>({ tagList: [], paramString: "" });
	const { startNavigation } = useGalleryLoading();

	// Initialize from URL params and handle async searchParams
	useEffect(() => {
		const getParams = async () => {
			const params = await searchParams;
			const tagsList = params.getAll("tag");

			setParamObject({
				tagList: tagsList,
				paramString: params.toString(),
			});

			if (tagsList.length > 0 && !isInitialized) {
				setSelectedTags(tagsList);
				setIsInitialized(true);
			}
		};

		getParams();
	}, [searchParams, setSelectedTags, isInitialized]);

	// Toggle tag handler - updates URL
	const toggleTag = (tag: string) => {
		const current = new URLSearchParams(paramObject.paramString);

		// Reset to page 1 when filtering changes
		if (current.has("page")) {
			current.set("page", "1");
		}

		// Handle tag toggling
		if (selectedTags.includes(tag)) {
			// Remove tag
			current.delete("tag");
			const newTags = selectedTags.filter((t) => t !== tag);
			for (const t of newTags) {
				current.append("tag", t);
			}
			setSelectedTags(newTags);
		} else {
			// Add tag
			current.append("tag", tag);
			setSelectedTags([...selectedTags, tag]);
		}

		// Wrap router push in startNavigation
		startNavigation(() => {
			router.push(`?${current.toString()}`);
		});
	};

	// Clear all tags handler
	const clearTags = () => {
		const current = new URLSearchParams(paramObject.paramString);
		current.delete("tag");

		// Reset to page 1 when clearing filters
		if (current.has("page")) {
			current.set("page", "1");
		}

		setSelectedTags([]);
		// Wrap router push in startNavigation
		startNavigation(() => {
			router.push(`?${current.toString()}`);
		});
	};

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
