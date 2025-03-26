/**
 * 任务状态类型 - 与 Trigger.dev 状态一致
 *
 * - COMPLETED: 任务已成功完成
 * - CANCELED: 任务被用户或系统取消
 * - FAILED: 任务执行失败
 * - CRASHED: 任务崩溃
 * - SYSTEM_FAILURE: 系统故障
 * - INTERRUPTED: 任务被中断
 * - EXECUTING: 任务正在执行中
 * - WAITING: 任务等待执行
 * - PENDING: 任务已创建但尚未开始处理
 * - RUNNING: 任务正在运行
 */
export type TaskStatus =
	| "COMPLETED"
	| "CANCELED"
	| "FAILED"
	| "CRASHED"
	| "SYSTEM_FAILURE"
	| "INTERRUPTED"
	| "EXECUTING"
	| "WAITING"
	| "PENDING"
	| "RUNNING";

export interface TaskStatusResponse {
	taskId: string;
	status: TaskStatus;
	output: unknown;
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
