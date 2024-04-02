import { Job } from "bullmq";

export interface JobHandlers<T, R = void> {
  handle: (job: Job<T, R>) => Promise<R>;
  completed: (job: Job) => Promise<void>;
  failed: (job?: Job, error?: Error) => Promise<void>;
}
