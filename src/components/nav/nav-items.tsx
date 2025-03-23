"use client";

import { Button } from "@/components/ui/button";
import { GalleryHorizontal, Home, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavItems() {
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(`${path}/`);
	};
	return (
		<div className="hidden items-center space-x-1 md:flex">
			<Link href="/">
				<Button
					variant={isActive("/dashboard") ? "default" : "ghost"}
					className="flex items-center gap-2"
					size="sm"
				>
					<Home className="h-4 w-4" />
					<span>首页</span>
				</Button>
			</Link>
			<Link href="/gallery">
				<Button
					variant={isActive("/gallery") ? "default" : "ghost"}
					className="flex items-center gap-2"
					size="sm"
				>
					<GalleryHorizontal className="h-4 w-4" />
					<span>作品集</span>
				</Button>
			</Link>
			<Link href="/wizard">
				<Button
					variant={isActive("/wizard") ? "default" : "ghost"}
					className="flex items-center gap-2"
					size="sm"
				>
					<Palette className="h-4 w-4" />
					<span>调样式</span>
				</Button>
			</Link>
		</div>
	);
}
