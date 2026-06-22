import "dotenv/config";
import fastify from "./http/server"

import { env } from './config/env';
import { getMongoDatabaseConnector } from "./factory";

const start = async () => {
  try {
    const port = env.PORT;
    const host = '0.0.0.0';
    
    await getMongoDatabaseConnector().connect()
    await fastify.listen({ port, host });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
