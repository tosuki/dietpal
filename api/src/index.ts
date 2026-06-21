import "dotenv/config";
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { dietRouter } from './http/routes/diet.router.js';
import { foodRouter } from './http/routes/food.router.js';
import { prisma } from './lib/prisma.js';

const fastify = Fastify({
  logger: env.NODE_ENV === 'development',
});

// Registrar o CORS
await fastify.register(cors, {
  origin: '*', // Permitir acesso de qualquer origem em ambiente de desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Registrar as Rotas
await fastify.register(dietRouter, { prefix: '/api/diets' });
await fastify.register(foodRouter, { prefix: '/api/foods' });

// Rota de Status
fastify.get('/status', async () => {
  return { status: 'ok', time: new Date() };
});

// Hook para desconectar o Prisma ao fechar o servidor
fastify.addHook('onClose', async () => {
  await prisma.$disconnect();
});

const start = async () => {
  try {
    const port = env.PORT;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
