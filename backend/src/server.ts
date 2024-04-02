import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import fastifyCors from "@fastify/cors";
import fastifyMultipart, { MultipartFile } from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";

import { uploadImageQueue } from "./queues/upload-image/upload-image.queue";
import { logger } from "./logger";
import { Jobs } from "./jobs/job.constants";

const BULL_DASHBOARD_ROUTE = "/dashboard";

export const setupServer = async (): Promise<FastifyInstance> => {
  const server: FastifyInstance = fastify();

  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(uploadImageQueue)],
    serverAdapter,
  });

  serverAdapter.setBasePath(BULL_DASHBOARD_ROUTE);

  await server.register(serverAdapter.registerPlugin(), {
    prefix: BULL_DASHBOARD_ROUTE,
    basePath: BULL_DASHBOARD_ROUTE,
  });

  await server.register(fastifyCors, {
    origin: "*",
    exposedHeaders: ["*"],
    methods: ["*"],
  });

  await server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 1048576, // 1MB
      files: 1,
    },
  });

  const uploadsDirectory = path.join(__dirname, "..", "uploads");

  // Check if uploads directory exists, create it if not
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory);
  }

  await server.register(fastifyStatic, {
    root: uploadsDirectory,
    prefix: "/uploads/",
  });

  server.get(
    "/healthcheck",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({ message: "OK" });
    }
  );

  server.register(
    async (instance: FastifyInstance) => {
      /**
       * Add a job to upload an image to queue
       */
      instance.post(
        "/upload-image",
        async (
          request: FastifyRequest<{ Body: { file: MultipartFile } }>,
          reply: FastifyReply
        ) => {
          const file = request?.body?.file;

          if (!file) {
            return reply.code(404).send({ error: "File not found." });
          }

          const mimeType = file.mimetype;

          if (!mimeType.startsWith("image/")) {
            return reply
              .code(400)
              .send({ error: "Only image files are allowed." });
          }

          const bufferFile: Buffer = await file.toBuffer();

          const uploadImageJob = await uploadImageQueue.add(Jobs.UPLOAD_IMAGE, {
            filename: file.filename,
            file: bufferFile,
          });

          const url = `${request.protocol}://${request.hostname}/api/v1/image/${uploadImageJob.id}`;

          return reply
            .code(201)
            .send({ id: uploadImageJob.id, pollingUrl: url });
        }
      );

      /**
       * Get the image data by job id
       */
      instance.get(
        "/image/:jobId",
        async (
          request: FastifyRequest<{ Params: { jobId: string } }>,
          reply: FastifyReply
        ) => {
          const jobId = request.params?.jobId;

          // Finds the job by the uuid that was passed for the name
          const job = await uploadImageQueue.getJob(jobId);

          if (!job) {
            return reply
              .code(404)
              .send({ error: "Uploading image job not found" });
          }

          const imageName = job.returnvalue?.imageFileName;

          return reply.code(200).send({
            status: await job.getState(),
            imageUrl: imageName
              ? `${request.protocol}://${request.hostname}/uploads/${imageName}`
              : null,
          });
        }
      );
    },
    { prefix: "/api/v1" }
  );

  // Error handler
  server.setErrorHandler(
    (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      logger.error(`An error occurred: ${error.message}`);
      return reply
        .code(500)
        .send({ error: error.message ?? "Internal Server Error" });
    }
  );

  return server;
};
