"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Eye } from "lucide-react";
import { useState } from "react";

interface ValidationResult {
	valid: boolean;
	errors: string[];
}

interface CodeOutputProps {
	code: string;
	validationResult: ValidationResult;
}

export function CodeOutput({ code, validationResult }: CodeOutputProps) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	const openPreview = () => {
		const contentId = Date.now().toString();
		localStorage.setItem(`preview_content_${contentId}`, code);
		window.open(`/preview?id=${contentId}`, "_blank");
	};

	return (
		<Card className="overflow-hidden">
			<div className="flex items-center justify-between p-4 bg-muted/50">
				<h2 className="text-lg font-semibold">Generated Code</h2>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={openPreview}
						disabled={!code}
						title="Open Preview"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={copyToClipboard}
						disabled={!code}
						title={copied ? "Copied!" : "Copy Code"}
					>
						{copied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			<div className="relative">
				{validationResult.errors.length > 0 && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
						<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
							<h3 className="font-semibold mb-2">Validation Errors:</h3>
							<ul className="list-disc list-inside space-y-1">
								{validationResult.errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						</div>
					</div>
				)}

				<pre className="p-4 overflow-auto max-h-[600px] text-sm">
					<code>{code || "No code generated yet..."}</code>
				</pre>
			</div>
		</Card>
	);
}
