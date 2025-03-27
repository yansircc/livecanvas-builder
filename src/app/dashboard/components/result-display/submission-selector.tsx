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
import type { PersistedSubmission } from "@/types/common";
import { ChevronDown, Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDialogueStore } from "../../hooks";

export function SubmissionSelector() {
	const { dialogues, activeDialogueId, setActiveSubmission, deleteSubmission } =
		useDialogueStore();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [submissionToDelete, setSubmissionToDelete] = useState<number | null>(
		null,
	);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Find active dialogue
	const activeDialogue = dialogues.find(
		(dialogue) => dialogue.id === activeDialogueId,
	);

	// If no dialogue or no submissions, don't render anything
	if (!activeDialogue || activeDialogue.submissions.length === 0) {
		return null;
	}

	const handleSubmissionSelect = (submissionId: number) => {
		setActiveSubmission(activeDialogueId, submissionId);
		setIsDropdownOpen(false);
	};

	const handleDeleteClick = (e: React.MouseEvent, submissionId: number) => {
		e.stopPropagation();
		if (activeDialogue.submissions.length <= 1) return;
		setSubmissionToDelete(submissionId);
		setIsAlertOpen(true);
	};

	const handleConfirmDelete = () => {
		if (submissionToDelete) {
			deleteSubmission(activeDialogueId, submissionToDelete);
		}
		setSubmissionToDelete(null);
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

	// Only show delete button if there's more than one submission
	const showDeleteButton = activeDialogue.submissions.length > 1;
	const activeSubmissionId = activeDialogue.activeSubmissionId;
	const activeSubmission = activeDialogue.submissions.find(
		(v: PersistedSubmission) => v.id === activeSubmissionId,
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
							版本 {activeSubmissionId}
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
							{activeDialogue.submissions.map((submission) => (
								<div
									key={submission.id}
									className={cn(
										"group/item relative flex items-center justify-between px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800",
										submission.id === activeSubmissionId &&
											"bg-zinc-50 dark:bg-zinc-800",
									)}
								>
									<button
										type="button"
										onClick={() => handleSubmissionSelect(submission.id)}
										className="flex-1 text-sm text-zinc-700 dark:text-zinc-300"
										disabled={submission.isLoading}
									>
										{submission.isLoading
											? "加载中..."
											: `版本 ${submission.id}`}
									</button>
									{showDeleteButton && !submission.isLoading && (
										<button
											type="button"
											className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-red-600 opacity-0 transition-opacity hover:bg-red-200 group-hover/item:opacity-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
											onClick={(e) => handleDeleteClick(e, submission.id)}
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
							确定要删除版本 {submissionToDelete} 吗？此操作无法撤销。
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
