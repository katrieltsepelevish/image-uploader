import { Worker } from "bullmq";

import { UploadImageJob } from "./upload-image.job";
import { Queues } from "../../queues/queue.constants";
import { concurrency, connection } from "../../queues/queue.config";

const uploadImageJob = new UploadImageJob();

export const uploadImageWorker = new Worker(
  Queues.IMAGE_UPLOADER,
  uploadImageJob.handle,
  {
    connection,
    concurrency,
  }
);

uploadImageWorker.on("completed", uploadImageJob.completed);

uploadImageWorker.on("failed", uploadImageJob.failed);
