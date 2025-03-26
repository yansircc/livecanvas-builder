import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { useState } from "react";
import { refreshModels } from "../actions/refresh-models";

export const RefreshModelsButton = () => {
	const [isRotating, setIsRotating] = useState(false);

	const handleRefresh = async () => {
		setIsRotating(true);
		await refreshModels();
		// Reset after animation completes
		setTimeout(() => setIsRotating(false), 750);
	};

	return (
		<Button variant="ghost" size="icon" onClick={handleRefresh}>
			<motion.div
				animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
			>
				<RotateCw className="h-3 w-3" />
			</motion.div>
		</Button>
	);
};
