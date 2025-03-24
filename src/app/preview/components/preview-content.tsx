"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Session } from "next-auth";
import { usePreview } from "../hooks/use-preview";
import { useScreenshot } from "../hooks/use-screenshot";
import { CopyButton } from "./copy-button";
import { CssMissingDialog } from "./css-missing-dialog";
import { PublishProjectDialog } from "./publish-project-dialog";
import { ThemeSwitcher } from "./theme-swither";

interface PreviewContentProps {
	session: Session | null;
}

export function PreviewContent({ session }: PreviewContentProps) {
	const {
		iframeContent,
		device,
		iframeHeight,
		uniqueKey,
		iframeRef,
		showCssMissingDialog,
		hasDataTheme,
		availableThemes,
		currentTheme,
		setDevice,
		handleCloseCssMissingDialog,
		getContentToCopy,
		changeTheme,
	} = usePreview();

	// Use the screenshot hook
	const { getScreenshot, isCapturing } = useScreenshot({
		iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
		device,
		setDevice,
	});

	const isDesktop = device === "desktop";
	const currentDevice = {
		mobile: { width: "375px", height: "667px" },
		tablet: { width: "768px", height: "1024px" },
		desktop: { width: "100%", height: "auto" },
	}[device];

	return (
		<div className="flex flex-col gap-8 bg-neutral-50 dark:bg-neutral-900">
			{/* CSS Missing Dialog */}
			<CssMissingDialog
				open={showCssMissingDialog}
				onClose={handleCloseCssMissingDialog}
			/>

			{/* Main content area - Only Preview */}
			<main className="flex-1 p-4">
				{/* Preview area */}
				<div className="container mx-auto flex h-full flex-col rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
					<div className="flex items-center justify-between border-neutral-200 border-b px-4 py-2 dark:border-neutral-800">
						<h2 className="font-medium text-neutral-900 text-sm dark:text-neutral-100">
							预览
						</h2>

						{/* Device selector - moved from header to preview bar */}
						<div className="flex items-center rounded-md border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
							<button
								onClick={() => setDevice("mobile")}
								className={`flex h-7 w-7 items-center justify-center rounded-sm ${
									device === "mobile"
										? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
										: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
								}`}
								title="移动视图"
								type="button"
							>
								<Smartphone className="h-3.5 w-3.5" />
							</button>
							<button
								onClick={() => setDevice("tablet")}
								className={`flex h-7 w-7 items-center justify-center rounded-sm ${
									device === "tablet"
										? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
										: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
								}`}
								title="平板视图"
								type="button"
							>
								<Tablet className="h-3.5 w-3.5" />
							</button>
							<button
								onClick={() => setDevice("desktop")}
								className={`flex h-7 w-7 items-center justify-center rounded-sm ${
									device === "desktop"
										? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
										: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
								}`}
								title="桌面视图"
								type="button"
							>
								<Monitor className="h-3.5 w-3.5" />
							</button>
						</div>

						<div className="flex items-center gap-2">
							{/* Theme Switcher - only show if HTML has data-theme */}
							{hasDataTheme && (
								<ThemeSwitcher
									availableThemes={availableThemes}
									currentTheme={currentTheme}
									onThemeChange={changeTheme}
								/>
							)}

							{/* Copy HTML Button */}
							<CopyButton getContentToCopy={getContentToCopy} />

							{/* Publish Project Dialog */}
							<PublishProjectDialog
								htmlContent={getContentToCopy()}
								getScreenshot={getScreenshot}
								isCapturingScreenshot={isCapturing}
								userId={session?.user?.id}
							/>
						</div>
					</div>
					<div className="flex-1 overflow-auto p-4">
						<div
							className="mx-auto"
							style={{
								width: currentDevice.width,
								maxWidth: isDesktop ? "100%" : currentDevice.width,
								transition: "width 0.3s ease",
							}}
						>
							<div
								className={`relative overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 ${
									!isDesktop ? "mx-auto" : "w-full max-w-full"
								}`}
							>
								<div
									className="bg-white dark:bg-neutral-950"
									style={{
										height: !isDesktop
											? currentDevice.height
											: `${iframeHeight}px`,
										transition: "height 0.3s ease",
										overflow: !isDesktop ? "hidden" : "visible",
									}}
								>
									<iframe
										key={uniqueKey}
										ref={iframeRef}
										srcDoc={iframeContent}
										className="h-full w-full border-0"
										title="UI 预览"
										sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
										loading="lazy"
										onLoad={() => {
											// Try to force a resize after load
											setTimeout(() => {
												iframeRef.current?.contentWindow?.postMessage(
													"checkSize",
													"*",
												);
											}, 200);
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
