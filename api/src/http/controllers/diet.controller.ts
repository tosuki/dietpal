import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  dietInputSchema,
} from "../schema/diet.schema.js"

import { ListDietsUseCase } from '../../usecases/diet/list-diets.usecase.js';
import { GetActiveDietUseCase } from '../../usecases/diet/get-active-diet.usecase.js';
import { GetDietByIdUseCase } from '../../usecases/diet/get-diet-by-id.usecase.js';
import { CreateDietUseCase } from '../../usecases/diet/create-diet.usecase.js';
import { UpdateDietUseCase } from '../../usecases/diet/update-diet.usecase.js';
import { DeleteDietUseCase } from '../../usecases/diet/delete-diet.usecase.js';
import { SetActiveDietUseCase } from '../../usecases/diet/set-active-diet.usecase.js';

/**
 * Controlador HTTP responsável por receber requisições relacionadas a dietas e direcioná-las aos Use Cases correspondentes.
 * 
 * @example
 * const dietController = new DietController();
 * fastify.get('/diets', dietController.listAll);
 */
export class DietController {
  constructor(
    private listDietsUseCase: ListDietsUseCase,
    private getActiveDietUseCase: GetActiveDietUseCase,
    private getDietByIdUseCase: GetDietByIdUseCase,
    private createDietUseCase: CreateDietUseCase,
    private updateDietUseCase: UpdateDietUseCase,
    private deleteDietUseCase: DeleteDietUseCase,
    private setActiveDietUseCase: SetActiveDietUseCase
  ) {}

  /**
   * Lista todas as dietas (versão rasa).
   */
  listAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const diets = await this.listDietsUseCase.execute();
      return reply.send(diets);
    } catch (error) {
      console.error('Erro ao listar dietas:', error);
      return reply.code(500).send({ error: 'Erro ao listar dietas' });
    }
  };

  /**
   * Obtém os detalhes da dieta ativa do sistema.
   */
  findActive = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const activeDiet = await this.getActiveDietUseCase.execute();
      if (!activeDiet) {
        return reply.code(404).send({ error: 'Nenhuma dieta ativa encontrada' });
      }
      return reply.send(activeDiet);
    } catch (error) {
      console.error('Erro ao buscar dieta ativa:', error);
      return reply.code(500).send({ error: 'Erro ao buscar dieta ativa' });
    }
  };

  /**
   * Obtém os detalhes completos de uma dieta específica pelo ID.
   */
  findById = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    try {
      const diet = await this.getDietByIdUseCase.execute(id);
      if (!diet) {
        return reply.code(404).send({ error: 'Dieta não encontrada' });
      }
      return reply.send(diet);
    } catch (error) {
      console.error('Erro ao buscar dieta:', error);
      return reply.code(500).send({ error: 'Erro ao buscar dieta' });
    }
  };

  /**
   * Cria uma nova dieta completa com suas respectivas refeições e alimentos.
   */
  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const parsedBody = dietInputSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({ errors: parsedBody.error.format() });
    }

    const data = parsedBody.data;

    try {
      const newDiet = await this.createDietUseCase.execute(data);
      return reply.code(201).send(newDiet);
    } catch (error) {
      console.error('Erro ao criar dieta:', error);
      return reply.code(500).send({ error: 'Erro ao criar dieta' });
    }
  };

  /**
   * Atualiza as informações básicas e toda a árvore de refeições/alimentos de uma dieta pelo ID.
   */
  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = dietInputSchema.safeParse(request.body);

    if (!parsedParams.success) {
      return reply.code(400).send({ error: 'ID inválido' });
    }

    if (!parsedBody.success) {
      return reply.code(400).send({ errors: parsedBody.error.format() });
    }

    const { id } = parsedParams.data;
    const data = parsedBody.data;

    try {
      const updatedDiet = await this.updateDietUseCase.execute(id, data);
      return reply.send(updatedDiet);
    } catch (error: any) {
      console.error('Erro ao atualizar dieta:', error);
      if (error.message === 'Dieta não encontrada') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro ao atualizar dieta' });
    }
  };

  /**
   * Deleta uma dieta específica pelo ID.
   */
  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    try {
      await this.deleteDietUseCase.execute(id);
      return reply.send({ message: 'Dieta excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir dieta:', error);
      if (error.message === 'Dieta não encontrada') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro ao excluir dieta' });
    }
  };

  /**
   * Define uma dieta como ativa no sistema.
   */
  setActive = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    try {
      const updated = await this.setActiveDietUseCase.execute(id);
      return reply.send(updated);
    } catch (error: any) {
      console.error('Erro ao ativar dieta:', error);
      if (error.message === 'Dieta não encontrada') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro ao ativar dieta' });
    }
  };
}
