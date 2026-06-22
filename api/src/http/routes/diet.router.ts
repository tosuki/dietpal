import { FastifyInstance } from 'fastify';
import { getDietHttpControllerInstance } from '../../factory';

/**
 * Registra as rotas relacionadas a dietas no servidor Fastify.
 * Instancia e delega as requisições HTTP para os métodos correspondentes do DietController.
 * 
 * @param fastify Instância do servidor Fastify
 * @example
 * await fastify.register(dietRouter, { prefix: '/api/diets' });
 */
export async function dietRouter(fastify: FastifyInstance) {
  const dietController = getDietHttpControllerInstance()

  fastify.get('/', dietController.listAll);
  fastify.get('/active', dietController.findActive);
  fastify.get('/:id', dietController.findById);
  fastify.post('/', dietController.create);
  fastify.put('/:id', dietController.update);
  fastify.delete('/:id', dietController.delete);
  fastify.post('/:id/activate', dietController.setActive);
}
