import { FastifyInstance } from "fastify";

import { config } from "./config";
import { logger } from "./logger";
import { setupServer } from "./server";
import { initJobs } from "./queues/queue.utils";

const start = async (): Promise<void> => {
  try {
    const app: FastifyInstance = await setupServer();

    initJobs();

    await app.listen({
      host: "0.0.0.0",
      port: config.port,
    });

    logger.info(`🚀 Listening on localhost:${config.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
