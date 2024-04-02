import { Worker } from "bullmq";
import { uploadImageWorker } from "../jobs/upload-image/upload-image.worker";
import { logger } from "../logger";

const WorkerMap = new Map([["UploadImage", uploadImageWorker]]);

export const initJobs = () => {
  WorkerMap.forEach((worker: Worker) => {
    worker.on("error", (err) => {
      logger.error(err);
    });
  });
};
