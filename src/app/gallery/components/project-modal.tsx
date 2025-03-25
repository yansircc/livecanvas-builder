"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import { Bookmark, Check, Copy, Heart, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProjectModalProps {
	project: Project | null;
	onClose: () => void;
	hasPurchased: boolean;
	hasFavorited: boolean;
	onPurchase: (projectId: string, event?: React.MouseEvent) => void;
	onFavorite: (projectId: string, event?: React.MouseEvent) => void;
	onCopyCode?: (htmlContent: string) => void;
}

export function ProjectModal({
	project,
	onClose,
	hasPurchased,
	hasFavorited,
	onPurchase,
	onFavorite,
	onCopyCode,
}: ProjectModalProps) {
	const [isCopied, setIsCopied] = useState(false);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	// Event handlers (memoized) - must be defined before early return
	const handleImageLoad = () => {
		setIsImageLoaded(true);
	};

	const handleBackdropClick = () => {
		onClose();
	};

	// Handlers that depend on project - safely handle null case
	const handlePurchase = (e: React.MouseEvent) => {
		if (project) onPurchase(project.id, e);
	};

	const handleFavorite = (e: React.MouseEvent) => {
		if (project) onFavorite(project.id, e);
	};

	const handleCopy = async () => {
		if (!project?.htmlContent || !onCopyCode) return;

		try {
			await navigator.clipboard.writeText(project.htmlContent);
			setIsCopied(true);
			onCopyCode(project.htmlContent);

			// Reset copied state after 2 seconds
			const timer = setTimeout(() => setIsCopied(false), 2000);
			return () => clearTimeout(timer);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	// Early return if no project
	if (!project) return null;

	// Thumbnail fallback
	const thumbnailUrl =
		project.thumbnail ||
		"https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop";

	// Parse tags from comma-separated string
	const tags = project.tags
		? project.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0)
		: [];

	return (
		<>
			{/* Modal backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black bg-opacity-50"
				onClick={handleBackdropClick}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						handleBackdropClick();
					} else if (e.key === "Enter") {
						handleBackdropClick();
					}
				}}
				role="button"
				tabIndex={0}
			/>

			{/* Modal content */}
			<div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-lg bg-white p-6 md:inset-[10%] lg:inset-[15%] dark:bg-zinc-900">
				{/* Header with title and close button */}
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-2xl">{project.title}</h2>
					<Button variant="ghost" size="sm" onClick={onClose}>
						Close
					</Button>
				</div>

				{/* Main content area */}
				<div className="flex flex-1 flex-col gap-6 overflow-hidden md:flex-row md:gap-8">
					{/* Left: Project details */}
					<div className="flex w-full flex-col md:w-1/3">
						{/* Description */}
						{project.description && (
							<p className="mb-4 text-zinc-600 dark:text-zinc-300">
								{project.description}
							</p>
						)}

						{/* Tags */}
						{tags.length > 0 && (
							<div className="mb-4 flex flex-wrap gap-2">
								{tags.map((tag) => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
						)}

						{/* Author info */}
						<div className="mb-4 flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
								{project.user?.image ? (
									<Image
										src={project.user.image}
										alt={project.user.name || ""}
										width={32}
										height={32}
										className="h-full w-full object-cover"
									/>
								) : (
									<User className="h-5 w-5 text-zinc-500" />
								)}
							</div>
							<span className="text-sm text-zinc-600 dark:text-zinc-300">
								{project.user?.name || "Unknown User"}
							</span>
						</div>

						{/* Action buttons */}
						<div className="mt-auto flex items-center space-x-4">
							<Button
								variant="outline"
								size="sm"
								className="flex items-center space-x-1"
								onClick={handlePurchase}
							>
								<Heart
									className={`h-4 w-4 ${
										hasPurchased ? "fill-red-500 text-red-500" : ""
									}`}
								/>
								<span>{hasPurchased ? "Purchased" : "Purchase"}</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="flex items-center space-x-1"
								onClick={handleFavorite}
							>
								<Bookmark
									className={`h-4 w-4 ${
										hasFavorited ? "fill-yellow-500 text-yellow-500" : ""
									}`}
								/>
								<span>{hasFavorited ? "Saved" : "Save"}</span>
							</Button>
							{onCopyCode && (
								<Button
									variant="outline"
									size="sm"
									className={cn(
										"flex items-center space-x-1",
										"bg-emerald-50 dark:bg-emerald-950",
										"hover:bg-emerald-100 dark:hover:bg-emerald-900",
										"text-emerald-600 dark:text-emerald-300",
										"border border-emerald-200 dark:border-emerald-800",
										isCopied && "bg-emerald-100 dark:bg-emerald-900",
									)}
									onClick={handleCopy}
								>
									<div
										className={cn(
											"flex items-center justify-center gap-2",
											"transition-transform duration-200",
											isCopied && "scale-105",
										)}
									>
										{isCopied ? (
											<>
												<Check className="h-4 w-4 text-emerald-500" />
												<span>Copied!</span>
											</>
										) : (
											<>
												<Copy className="h-4 w-4 transition-transform duration-200" />
												<span>Copy Code</span>
											</>
										)}
									</div>
								</Button>
							)}
						</div>
					</div>

					{/* Right: Scrollable thumbnail image */}
					<div className="flex-1 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
						<div className="h-full overflow-auto">
							<div className="relative min-h-full w-full">
								{!isImageLoaded && (
									<div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
										<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-500" />
									</div>
								)}
								<Image
									src={thumbnailUrl}
									alt={project.title}
									width={1200}
									height={1600}
									className={`w-full object-contain ${
										isImageLoaded ? "opacity-100" : "opacity-0"
									}`}
									priority
									onLoad={handleImageLoad}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
