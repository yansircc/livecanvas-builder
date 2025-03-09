"use client";

import { VersionSelector } from "@/components/canvas/version-selector";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import { replaceImagePlaceholders } from "@/utils/replace-image-placeholders";
import { Check, Copy, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
	const { processedHtml } = useAppStore();

	const copyToClipboard = useCallback(async () => {
		try {
			// Get the code to copy
			let codeToCopy = processedHtml || code;

			// Replace image placeholder paths with CDN URLs
			codeToCopy = replaceImagePlaceholders(codeToCopy);

			await navigator.clipboard.writeText(codeToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	}, [processedHtml, code]);

	const openPreview = () => {
		const contentId = Date.now().toString();
		localStorage.setItem(`preview_content_${contentId}`, processedHtml || code);
		window.open(`/preview?id=${contentId}`, "_blank");
	};

	return (
		<div className="overflow-hidden h-full border rounded-lg cursor-not-allowed">
			<div className="flex items-center justify-between p-4 bg-muted/50 border-b">
				<h2 className="text-lg font-semibold">生成的代码</h2>
				<div className="flex items-center gap-4">
					<VersionSelector />
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={openPreview}
							disabled={!code}
							title="打开预览"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={copyToClipboard}
							disabled={!code}
							title={copied ? "已复制！" : "复制最终的HTML"}
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="relative">
				{validationResult.errors.length > 0 && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
						<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
							<h3 className="font-semibold mb-2">验证错误:</h3>
							<ul className="list-disc list-inside space-y-1">
								{validationResult.errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						</div>
					</div>
				)}

				<div
					className="absolute inset-0 z-10"
					style={{ pointerEvents: "none" }}
				/>

				<pre className="p-4 overflow-auto max-h-[calc(100vh-270px)] text-sm relative select-none">
					<code className="block">{code}</code>
				</pre>
			</div>
		</div>
	);
}
