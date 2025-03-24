export type TaskStatus = "processing" | "completed" | "error";

export interface TaskStatusResponse {
	taskId: string;
	status: TaskStatus;
	output?: unknown;
	error?: unknown;
	startedAt?: string;
	completedAt?: string;
	originalStatus?: string;
}

export interface ChatTaskResponse {
	taskId: string;
	status: TaskStatus;
	code: string;
	advices: string[];
}
