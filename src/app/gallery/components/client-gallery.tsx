"use client";

import type { Project } from "@/types/project";
import { useState } from "react";
import { favoriteProject, purchaseProject } from "../actions";
import { GalleryHeader } from "./gallery-header";
import { GalleryLoading } from "./gallery-loading";
import { useGalleryLoading } from "./gallery-loading-provider";
import { GalleryPagination } from "./gallery-pagination";
import { GalleryProjectCard } from "./gallery-project-card";
import { ProjectModal } from "./project-modal";

interface PaginationData {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface ClientGalleryProps {
	initialProjects: Project[];
	initialInteractions: Record<
		string,
		{ hasPurchased: boolean; hasFavorited: boolean }
	>;
	userId?: string;
	isAuthenticated: boolean;
	pagination: PaginationData;
	selectedTags?: string[];
	allAvailableTags: string[];
}

export function ClientGallery({
	initialProjects,
	initialInteractions,
	userId,
	isAuthenticated,
	pagination,
	selectedTags: initialSelectedTags = [],
	allAvailableTags,
}: ClientGalleryProps) {
	const [selectedTags, setSelectedTags] =
		useState<string[]>(initialSelectedTags);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [interactions, setInteractions] = useState(initialInteractions);
	const { isNavigating } = useGalleryLoading();

	// Handle interactions
	const handleInteraction = async (
		projectId: string,
		action: "purchase" | "favorite",
		event?: React.MouseEvent,
	) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		if (!isAuthenticated || !userId) return;

		// Optimistic update
		setInteractions((prev) => {
			const current = prev[projectId] || {
				hasPurchased: false,
				hasFavorited: false,
			};
			return {
				...prev,
				[projectId]: {
					...current,
					[action === "purchase" ? "hasPurchased" : "hasFavorited"]:
						!current[action === "purchase" ? "hasPurchased" : "hasFavorited"],
				},
			};
		});

		// Call the server action
		if (action === "purchase") {
			await purchaseProject(projectId, userId);
		} else {
			await favoriteProject(projectId, userId);
		}
	};

	const handlepurchase = (projectId: string, event?: React.MouseEvent) =>
		handleInteraction(projectId, "purchase", event);

	const handleFavorite = (projectId: string, event?: React.MouseEvent) =>
		handleInteraction(projectId, "favorite", event);

	return (
		<>
			<GalleryHeader
				selectedTags={selectedTags}
				setSelectedTags={setSelectedTags}
				availableTags={allAvailableTags}
			/>

			<div className="relative mt-6">
				{isNavigating && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50">
						<GalleryLoading />
					</div>
				)}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{initialProjects.length > 0 ? (
						initialProjects.map((project) => (
							<GalleryProjectCard
								key={project.id}
								project={project}
								onSelect={setSelectedProject}
								hasPurchased={interactions[project.id]?.hasPurchased || false}
								hasFavorited={interactions[project.id]?.hasFavorited || false}
								onPurchase={handlepurchase}
								onFavorite={handleFavorite}
							/>
						))
					) : (
						<div className="col-span-full flex h-32 items-center justify-center text-zinc-500">
							No projects found
						</div>
					)}
				</div>
			</div>

			{/* Pagination Component */}
			<GalleryPagination pagination={pagination} />

			{selectedProject && (
				<ProjectModal
					project={selectedProject}
					onClose={() => setSelectedProject(null)}
					hasPurchased={interactions[selectedProject.id]?.hasPurchased || false}
					hasFavorited={interactions[selectedProject.id]?.hasFavorited || false}
					onPurchase={handlepurchase}
					onFavorite={handleFavorite}
					onCopyCode={(htmlContent) => {
						void navigator.clipboard.writeText(htmlContent);
					}}
				/>
			)}
		</>
	);
}
