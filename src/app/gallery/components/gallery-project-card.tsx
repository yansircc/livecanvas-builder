"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { Bookmark, Heart, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
  hasPurchased?: boolean;
  hasFavorited?: boolean;
  onPurchase?: (projectId: string, event?: React.MouseEvent) => void;
  onFavorite?: (projectId: string, event?: React.MouseEvent) => void;
}

// Memoized component to prevent unnecessary re-renders
export const GalleryProjectCard = function GalleryProjectCard({
  project,
  onSelect,
  hasPurchased = false,
  hasFavorited = false,
  onPurchase,
  onFavorite,
}: ProjectCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Default thumbnail if none provided
  const thumbnailUrl =
    project.thumbnail ||
    "https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop";

  // Parse tags from comma-separated string
  const tags = project.tags
    ? project.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // Event handlers
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleCardClick = () => {
    if (onSelect) onSelect(project);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPurchase) onPurchase(project.id, e);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) onFavorite(project.id, e);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`relative h-full w-full ${
            !isImageLoaded ? "animate-pulse" : ""
          }`}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-400" />
            </div>
          )}
          <Image
            src={thumbnailUrl}
            alt={project.title}
            width={600}
            height={400}
            className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority={false}
            loading="lazy"
            onLoad={handleImageLoad}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJcUZXpJgAAAABJRU5ErkJggg=="
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-medium text-lg">{project.title}</h3>
        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              {project.user?.image ? (
                <Image
                  src={project.user.image}
                  alt={project.user.name || ""}
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : project.user?.name ? (
                <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
                  {project.user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4 text-zinc-500" />
              )}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {project.user?.name || "Unknown User"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onPurchase && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={handlePurchaseClick}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      hasPurchased
                        ? "fill-red-500 text-red-500"
                        : "text-zinc-400"
                    }`}
                  />
                </Button>
                <span className="text-xs text-zinc-500">
                  {project.purchaseCount}
                </span>
              </>
            )}

            {onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={handleFavoriteClick}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    hasFavorited
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-zinc-400"
                  }`}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
