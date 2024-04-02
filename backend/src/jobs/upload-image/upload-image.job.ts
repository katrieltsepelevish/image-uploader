import { Job } from "bullmq";
import path from "path";
import jimp from "jimp";

import { JobHandlers } from "../job.interfaces";
import { logger } from "../../logger";
import { config } from "../../config";
import {
  UploadImageJobDataType,
  UploadImageJobReturnType,
} from "./upload-image.interfaces";

export class UploadImageJob
  implements JobHandlers<UploadImageJobDataType, UploadImageJobReturnType>
{
  async handle(job: Job<UploadImageJobDataType, UploadImageJobReturnType>) {
    const { file, filename } = job.data;

    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}-${filename}`;
    const filePath = path.join(__dirname, "../../../uploads/", fileName);

    const buffer = Buffer.from(file);

    const image = await jimp.read(buffer);
    await image.quality(20).writeAsync(filePath);

    logger.info(
      `File "${filename}" uploaded as "${fileName}" to uploads directory.`
    );

    return { imageFileName: fileName };
  }

  async completed(job: Job) {
    logger.info(`[Upload Image] Job (id: ${job.id}) has completed.`);
  }

  async failed(job?: Job, error?: Error) {
    logger.error(
      `[Upload Image] Job (id: ${job?.id}) has failed - ${error?.message}.`
    );
  }
}
