"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGalleryLoading } from "./gallery-loading-provider";

interface PaginationData {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface GalleryPaginationProps {
	pagination: PaginationData;
	preserveFilter?: boolean;
}

export function GalleryPagination({
	pagination,
	preserveFilter = true,
}: GalleryPaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [paramString, setParamString] = useState("");
	const { startNavigation } = useGalleryLoading();

	// Handle async searchParams
	useEffect(() => {
		const getParams = async () => {
			const params = await searchParams;
			setParamString(params.toString());
		};

		getParams();
	}, [searchParams]);

	const handlePageChange = (newPage: number) => {
		const current = new URLSearchParams(paramString);

		// Set the new page
		current.set("page", newPage.toString());

		// If not preserving filters, remove any tag filters
		if (!preserveFilter && current.has("tag")) {
			current.delete("tag");
		}

		// Wrap router push in startNavigation
		startNavigation(() => {
			router.push(`?${current.toString()}`);
		});
	};

	// Don't render if there's only one page
	if (pagination.totalPages <= 1) {
		return null;
	}

	return (
		<div className="mt-8 flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => handlePageChange(pagination.page - 1)}
				disabled={!pagination.hasPrevPage}
			>
				<ChevronLeft className="mr-1 h-4 w-4" />
				Previous
			</Button>

			<div className="mx-4 text-sm">
				Page {pagination.page} of {pagination.totalPages}
			</div>

			<Button
				variant="outline"
				size="sm"
				onClick={() => handlePageChange(pagination.page + 1)}
				disabled={!pagination.hasNextPage}
			>
				Next
				<ChevronRight className="ml-1 h-4 w-4" />
			</Button>
		</div>
	);
}
