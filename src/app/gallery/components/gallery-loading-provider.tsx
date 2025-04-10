"use client";

import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useContext,
	useState,
	useTransition,
} from "react";

interface GalleryLoadingContextProps {
	isNavigating: boolean;
	startNavigation: (callback: () => void) => void;
}

const GalleryLoadingContext = createContext<
	GalleryLoadingContextProps | undefined
>(undefined);

export function GalleryLoadingProvider({ children }: { children: ReactNode }) {
	const [isPending, startTransition] = useTransition();

	const startNavigation = (callback: () => void) => {
		startTransition(() => {
			callback();
		});
	};

	return (
		<GalleryLoadingContext.Provider
			value={{ isNavigating: isPending, startNavigation }}
		>
			{children}
		</GalleryLoadingContext.Provider>
	);
}

export function useGalleryLoading() {
	const context = useContext(GalleryLoadingContext);
	if (context === undefined) {
		throw new Error(
			"useGalleryLoading must be used within a GalleryLoadingProvider",
		);
	}
	return context;
}
