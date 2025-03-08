"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/use-app-store";
import { Settings } from "lucide-react";
import { useState } from "react";

export function SettingsDialog() {
	const { apiKey, setState } = useAppStore();
	const [tempApiKey, setTempApiKey] = useState(apiKey);
	const [open, setOpen] = useState(false);

	const handleSave = () => {
		setState("apiKey", tempApiKey);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Settings className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Open settings</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure your OpenRouter API key and other settings.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="api-key" className="text-right">
							API Key
						</Label>
						<Input
							id="api-key"
							type="password"
							placeholder="Enter your OpenRouter API key"
							value={tempApiKey ?? ""}
							onChange={(e) => setTempApiKey(e.target.value)}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="submit" onClick={handleSave}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
