import { IFoodRepository } from '../food.repository.interface.js';
import { Food } from '../types.js';
import { prisma } from '../../lib/prisma.js';

/**
 * Implementação do repositório de Alimentos utilizando o Prisma ORM e PostgreSQL.
 * 
 * @example
 * const repository = new PrismaFoodRepository();
 * const foods = await repository.search('frango');
 */
export class PrismaFoodRepository implements IFoodRepository {
  /**
   * Realiza busca insensível a maiúsculas/minúsculas limitada a 50 itens de alimentos no PostgreSQL.
   * 
   * @param query Termo de pesquisa
   * @returns Lista de alimentos correspondentes
   */
  async search(query: string): Promise<Food[]> {
    return prisma.food.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 50,
    });
  }

  /**
   * Busca um alimento cadastrado pelo nome exato.
   * 
   * @param name Nome do alimento
   * @returns Alimento encontrado ou null
   */
  async findByName(name: string): Promise<Food | null> {
    return prisma.food.findUnique({
      where: { name },
    });
  }

  /**
   * Busca um alimento pelo ID UUID.
   * 
   * @param id ID do alimento
   * @returns Alimento encontrado ou null
   */
  async findById(id: string): Promise<Food | null> {
    return prisma.food.findUnique({
      where: { id },
    });
  }

  /**
   * Cria um registro permanente de alimento customizado no banco de dados.
   * 
   * @param data Informações nutricionais do alimento por 100g
   * @returns Alimento persistido
   */
  async createCustom(data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<Food> {
    return prisma.food.create({
      data: {
        ...data,
        isCustom: true,
      },
    });
  }

  /**
   * Deleta fisicamente um alimento customizado permanente.
   * 
   * @param id ID do alimento customizado
   */
  async deleteCustom(id: string): Promise<void> {
    await prisma.food.delete({
      where: { id },
    });
  }
}
