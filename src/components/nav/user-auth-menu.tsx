import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

interface UserAuthMenuProps {
	session: Session | null;
}

export function UserAuthMenu({ session }: UserAuthMenuProps) {
	if (session) {
		return (
			<Button
				variant="ghost"
				className="relative h-9 w-9 rounded-full p-0"
				asChild
			>
				<Link href="/profile">
					<Avatar className="h-9 w-9">
						{session.user.image ? (
							<Image
								src={session.user.image}
								alt={session.user.name || "User"}
								fill
							/>
						) : (
							<AvatarFallback className="bg-primary text-primary-foreground">
								{session.user.name?.charAt(0) ||
									session.user.email?.charAt(0) ||
									"U"}
							</AvatarFallback>
						)}
					</Avatar>
				</Link>
			</Button>
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<User className="h-4 w-4" />
					<span>登录</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>认证</DialogTitle>
					<DialogDescription>
						登录到你的账户或创建一个新账户以保存你的工作并访问更多功能。
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-2 pt-4">
					<Link href="/api/auth/signin" className="w-full">
						登录
					</Link>
					<Link href="/api/auth/signup" className="w-full">
						创建账户
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	);
}
