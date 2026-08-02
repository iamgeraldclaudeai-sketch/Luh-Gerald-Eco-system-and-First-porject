// Lightweight stub for agent-action execution. Runs the task inline and
// reports pending/completed/failed status — swap the body for a real queue
// (e.g. a worker + Postgres-backed job table, or a hosted queue) without
// changing anything that calls runJob.
export type JobStatus = "pending" | "completed" | "failed";

export interface JobResult<T> {
  status: JobStatus;
  result?: T;
  error?: string;
}

export async function runJob<T>(task: () => Promise<T>): Promise<JobResult<T>> {
  try {
    const result = await task();
    return { status: "completed", result };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
