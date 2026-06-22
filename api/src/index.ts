import "dotenv/config";
import fastify from "./http/server"

import { env } from './config/env';
import { logger } from "./logger/logger";

import { getMongoDatabaseConnector } from "./factory";

const start = async () => {
  try {
    const port = env.SERVER_PORT;
    const host = env.SERVER_HOST;

    await getMongoDatabaseConnector().connect()
    await fastify.listen({ port, host });
    logger.debug(fastify.printRoutes())
  } catch (err) {
    logger.error(err)
    process.exit(1);
  }
};

start();
