"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Version } from "@/types/common";
import { ChevronDown, Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDialogueStore } from "../../hooks";

export default function VersionSelector() {
	const { dialogues, activeDialogueId, setActiveVersion, deleteVersion } =
		useDialogueStore();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [versionToDelete, setVersionToDelete] = useState<number | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Find active dialogue
	const activeDialogue = dialogues.find(
		(dialogue) => dialogue.id === activeDialogueId,
	);

	// If no dialogue or no versions, don't render anything
	if (!activeDialogue || activeDialogue.versions.length === 0) {
		return null;
	}

	const handleVersionSelect = (versionId: number) => {
		setActiveVersion(activeDialogueId, versionId);
		setIsDropdownOpen(false);
	};

	const handleDeleteClick = (e: React.MouseEvent, versionId: number) => {
		e.stopPropagation();
		if (activeDialogue.versions.length <= 1) return;
		setVersionToDelete(versionId);
		setIsAlertOpen(true);
	};

	const handleConfirmDelete = () => {
		if (versionToDelete) {
			deleteVersion(activeDialogueId, versionToDelete);
		}
		setVersionToDelete(null);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Only show delete button if there's more than one version
	const showDeleteButton = activeDialogue.versions.length > 1;
	const activeVersionId = activeDialogue.activeVersionId;
	const activeVersion = activeDialogue.versions.find(
		(v: Version) => v.id === activeVersionId,
	);

	return (
		<>
			<div className="group relative" ref={dropdownRef}>
				<button
					type="button"
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="group flex items-center gap-0.5 rounded-md px-3 py-1.5 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					aria-expanded={isDropdownOpen}
					aria-haspopup="true"
				>
					<Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
					<span className="text-zinc-700 dark:text-zinc-200">
						<span className="rounded-md bg-white px-2 py-1 text-sm transition-colors duration-200 group-hover:bg-zinc-100 dark:bg-zinc-900 dark:group-hover:bg-zinc-800">
							版本 {activeVersionId}
						</span>
					</span>
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500",
							isDropdownOpen && "rotate-180",
						)}
					/>
				</button>

				{isDropdownOpen && (
					<div className="absolute z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/10 ring-opacity-5 focus:outline-none dark:bg-zinc-900 dark:ring-zinc-700">
						<div className="py-1">
							{activeDialogue.versions.map((version) => (
								<div
									key={version.id}
									className={cn(
										"group/item relative flex items-center justify-between px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800",
										version.id === activeVersionId &&
											"bg-zinc-50 dark:bg-zinc-800",
									)}
								>
									<button
										type="button"
										onClick={() => handleVersionSelect(version.id)}
										className="flex-1 text-sm text-zinc-700 dark:text-zinc-300"
										disabled={version.isLoading}
									>
										{version.isLoading ? "加载中..." : `版本 ${version.id}`}
									</button>
									{showDeleteButton && !version.isLoading && (
										<button
											type="button"
											className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-red-600 opacity-0 transition-opacity hover:bg-red-200 group-hover/item:opacity-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
											onClick={(e) => handleDeleteClick(e, version.id)}
											aria-label="删除版本"
										>
											<X className="h-2 w-2" />
										</button>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
						<AlertDialogDescription>
							确定要删除版本 {versionToDelete} 吗？此操作无法撤销。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							删除
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
