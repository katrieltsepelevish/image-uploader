import { Queue } from "bullmq";

import { Queues } from "../queue.constants";
import { connection } from "../queue.config";
import { UploadImageJobDataType } from "../../jobs/upload-image/upload-image.interfaces";

export const uploadImageQueue = new Queue<UploadImageJobDataType>(
  Queues.IMAGE_UPLOADER,
  {
    connection,
  }
);
