export interface ChatTaskResponse {
	taskId: string;
	status: string;
	code: string;
	advices: string[];
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}
