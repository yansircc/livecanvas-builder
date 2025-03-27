"use client";

import type { PropsWithChildren } from "react";

// This provider doesn't do anything special yet, but it ensures the client components
// that use Zustand are properly mounted. It can be extended later if needed.
export default function DialogueProvider({ children }: PropsWithChildren) {
	return <>{children}</>;
}
