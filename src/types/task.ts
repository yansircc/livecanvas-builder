export type TaskStatus =
	| "pending"
	| "processing"
	| "completed"
	| "failed"
	| "error";

export interface TaskStatusResponse {
	taskId: string;
	status: TaskStatus;
	output: string;
	error:
		| {
				message: string;
				name?: string;
				stackTrace?: string;
		  }
		| string
		| undefined;
	startedAt: string | undefined;
	completedAt: string | undefined;
	originalStatus: string;
}
