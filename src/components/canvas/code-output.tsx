"use client";

import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

interface ValidationResult {
	valid: boolean;
	errors: string[];
}

interface CodeOutputProps {
	code: string | null;
	validationResult: ValidationResult;
}

export function CodeOutput({ code, validationResult }: CodeOutputProps) {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(
			() => {
				toast.success("Copied to clipboard!");
			},
			() => {
				toast.error("Failed to copy");
			},
		);
	};

	if (!code) return null;

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow">
			<div className="p-6 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Generated Code</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => copyToClipboard(code)}
					>
						<ClipboardCopy className="h-4 w-4 mr-2" />
						Copy
					</Button>
				</div>
				<div className="relative">
					<pre className="overflow-x-auto p-4 rounded-md bg-muted text-sm">
						<code>{code}</code>
					</pre>
				</div>

				{/* Validation Results */}
				{!validationResult.valid && (
					<div className="p-3 rounded-md bg-destructive/10 border border-destructive">
						<h3 className="font-semibold text-destructive">
							Validation Issues:
						</h3>
						<ul className="list-disc list-inside text-sm">
							{validationResult.errors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
