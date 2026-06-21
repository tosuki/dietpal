import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { foodRepository } from '../../repositories/index.js';
import { SearchFoodsUseCase } from '../../usecases/food/search-foods.usecase.js';
import { CreateCustomFoodUseCase } from '../../usecases/food/create-custom-food.usecase.js';
import { DeleteCustomFoodUseCase } from '../../usecases/food/delete-custom-food.usecase.js';

/**
 * Controlador HTTP responsável por receber requisições relacionadas a alimentos e direcioná-las aos Use Cases correspondentes.
 * 
 * @example
 * const foodController = new FoodController();
 * fastify.get('/foods', foodController.search);
 */
export class FoodController {
  private searchFoodsUseCase = new SearchFoodsUseCase(foodRepository);
  private createCustomFoodUseCase = new CreateCustomFoodUseCase(foodRepository);
  private deleteCustomFoodUseCase = new DeleteCustomFoodUseCase(foodRepository);

  /**
   * Trata a busca textual de alimentos com suporte a queries opcionais.
   * 
   * @param request Requisição HTTP do Fastify contendo opcionalmente a query 'q'
   * @param reply Resposta HTTP do Fastify
   * @returns Lista filtrada de alimentos
   */
  search = async (request: FastifyRequest, reply: FastifyReply) => {
    const querySchema = z.object({
      q: z.string().optional().default(''),
    });

    const parsedQuery = querySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.code(400).send({ error: 'Query parameters inválidos' });
    }

    const { q } = parsedQuery.data;

    try {
      const foods = await this.searchFoodsUseCase.execute(q);
      return reply.send(foods);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return reply.code(500).send({ error: 'Erro ao buscar alimentos' });
    }
  };

  /**
   * Trata a criação de um novo alimento customizado persistente.
   * 
   * @param request Requisição HTTP contendo corpo com os dados nutricionais do alimento
   * @param reply Resposta HTTP
   * @returns O alimento criado com status 201
   */
  createCustom = async (request: FastifyRequest, reply: FastifyReply) => {
    const bodySchema = z.object({
      name: z.string().min(1, 'Nome do alimento é obrigatório'),
      calories: z.number().nonnegative('Calorias devem ser positivas'),
      protein: z.number().nonnegative('Proteínas devem ser positivas'),
      carbs: z.number().nonnegative('Carboidratos devem ser positivas'),
      fat: z.number().nonnegative('Gorduras devem ser positivas'),
    });

    const parsedBody = bodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({ errors: parsedBody.error.format() });
    }

    const data = parsedBody.data;

    try {
      const customFood = await this.createCustomFoodUseCase.execute(data);
      return reply.code(201).send(customFood);
    } catch (error: any) {
      console.error('Erro ao criar alimento customizado:', error);
      if (error.message === 'Já existe um alimento com este nome') {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro ao criar alimento customizado' });
    }
  };

  /**
   * Trata a remoção definitiva de um alimento customizado permanente pelo ID.
   * 
   * @param request Requisição HTTP contendo o ID do alimento nos parâmetros
   * @param reply Resposta HTTP
   * @returns Mensagem de sucesso
   */
  deleteCustom = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    try {
      await this.deleteCustomFoodUseCase.execute(id);
      return reply.send({ message: 'Alimento excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir alimento:', error);
      if (error.message === 'Alimento não encontrado') {
        return reply.code(404).send({ error: error.message });
      }
      if (error.message === 'Não é possível excluir alimentos padrão da tabela TACO') {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro ao excluir alimento' });
    }
  };
}
