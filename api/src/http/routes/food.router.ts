import { FastifyInstance } from 'fastify';
import { getFoodHttpControllerInstance } from '../../factory';

/**
 * Registra as rotas relacionadas a alimentos no servidor Fastify.
 * Instancia e delega as requisições HTTP para os métodos correspondentes do FoodController.
 * 
 * @param fastify Instância do servidor Fastify
 * @example
 * await fastify.register(foodRouter, { prefix: '/api/foods' });
 */
export async function foodRouter(fastify: FastifyInstance) {
  const foodController = getFoodHttpControllerInstance()

  fastify.get('/', foodController.search);
  fastify.post('/custom', foodController.createCustom);
  fastify.delete('/custom/:id', foodController.deleteCustom);
}
