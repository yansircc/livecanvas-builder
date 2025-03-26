import "@/styles/globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "Livecanvs Builder",
	description: "Build your own Livecanvs",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
