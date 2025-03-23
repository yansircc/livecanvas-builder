"use client";

import type { Project } from "@/types";
import { useState } from "react";
import { favoriteProject, purchaseProject } from "../actions";
import { GalleryHeader } from "./gallery-header";
import { GalleryProjectCard } from "./gallery-project-card";
import { ProjectModal } from "./project-modal";

interface ClientGalleryProps {
	initialProjects: Project[];
	initialInteractions: Record<
		string,
		{ hasPurchased: boolean; hasFavorited: boolean }
	>;
	userId?: string;
	isAuthenticated: boolean;
}

export function ClientGallery({
	initialProjects,
	initialInteractions,
	userId,
	isAuthenticated,
}: ClientGalleryProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [interactions, setInteractions] = useState(initialInteractions);

	// Extract all available tags from projects
	const availableTags = initialProjects
		.flatMap((project) =>
			project.tags ? project.tags.split(",").map((tag) => tag.trim()) : [],
		)
		.filter((tag, index, self) => tag && self.indexOf(tag) === index)
		.sort();

	// Filter projects based on tags
	const filteredProjects = initialProjects.filter((project) => {
		// Skip filtering if no filters are applied
		if (selectedTags.length === 0) return true;

		// Filter by tags - project must contain ALL selected tags (intersection)
		if (selectedTags.length > 0) {
			if (!project.tags) return false;
			const projectTags = project.tags.split(",").map((tag) => tag.trim());
			return selectedTags.every((tag) => projectTags.includes(tag));
		}

		return true;
	});

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
				availableTags={availableTags}
			/>

			<div className="mt-6">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{filteredProjects.map((project) => (
						<GalleryProjectCard
							key={project.id}
							project={project}
							onSelect={setSelectedProject}
							hasPurchased={interactions[project.id]?.hasPurchased || false}
							hasFavorited={interactions[project.id]?.hasFavorited || false}
							onPurchase={handlepurchase}
							onFavorite={handleFavorite}
						/>
					))}

					{filteredProjects.length === 0 && (
						<div className="col-span-full flex h-32 items-center justify-center text-zinc-500">
							No projects found
						</div>
					)}
				</div>
			</div>

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
