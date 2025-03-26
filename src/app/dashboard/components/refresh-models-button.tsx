import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { refreshModels } from "../actions/refresh-models";

export const RefreshModelsButton = () => {
	return (
		<Button variant="outline" size="icon" onClick={() => refreshModels()}>
			<RotateCw className="h-4 w-4" />
		</Button>
	);
};
