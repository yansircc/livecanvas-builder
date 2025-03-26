"use client";

import { toast } from "sonner";

export default function Test() {
	const handleClick = () => {
		toast.error("Event has been created.");
	};
	return (
		<div>
			<button onClick={handleClick} type="button">
				Click me
			</button>
		</div>
	);
}
