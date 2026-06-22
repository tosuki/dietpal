import "dotenv/config";
import fastify from "./http/server"

import { env } from './config/env';
import { logger } from "./logger/logger";

import { getMongoDatabaseConnector } from "./factory";

const start = async () => {
  try {
    const port = env.PORT;
    const host = '0.0.0.0';
    
    await getMongoDatabaseConnector().connect()
    await fastify.listen({ port, host });

    logger.info(`Servidor rodando em http://localhost:${port}`);
    logger.debug(fastify.printRoutes())
  } catch (err) {
    logger.error(err)
    process.exit(1);
  }
};

start();
