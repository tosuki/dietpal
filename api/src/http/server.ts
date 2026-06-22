import Fastify from "fastify"

import cors from "@fastify/cors"

import { dietRouter } from "./routes/diet.router"
import { foodRouter } from "./routes/food.router"
import { env } from "../config/env"

import { getMongoDatabaseConnector } from "../factory"

const fastify = Fastify({
  logger: env.NODE_ENV === "development"
})

const mongoConnectionManager = getMongoDatabaseConnector()

// Registrar o CORS
fastify.register(cors, {
  origin: '*', // Permitir acesso de qualquer origem em ambiente de desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Registrar as Rotas
fastify.register(dietRouter, { prefix: '/api/diets' });
fastify.register(foodRouter, { prefix: '/api/foods' });

// Rota de Status
fastify.get('/status', async () => {
  return { status: 'ok', time: new Date() };
});

// Hook para desconectar o Prisma ao fechar o servidor
fastify.addHook('onClose', async () => {
  await mongoConnectionManager.close()
});

export default fastify