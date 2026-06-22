import { IDietRepository } from '../diet.repository.interface';
import { Diet, CreateDietInput } from '../types';
import { prisma } from '../../lib/prisma';

/**
 * Implementação do repositório de Dietas utilizando o Prisma ORM e PostgreSQL.
 * Gerencia a árvore agregada de Dietas -> Refeições -> Alimentos da refeição em transações integradas.
 * 
 * @example
 * const repository = new PrismaDietRepository();
 * const activeDiet = await repository.findActive();
 */
export class PrismaDietRepository implements IDietRepository {
  /**
   * Obtém a lista rasa de todas as dietas ordenadas pela última modificação descrescente.
   * 
   * @returns Lista de dietas sem os relacionamentos de refeição
   */
  async listAll(): Promise<Omit<Diet, 'meals'>[]> {
    return prisma.diet.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Obtém a dieta ativa atual incluindo todas as refeições e alimentos aninhados.
   * 
   * @returns Dieta completa ativa ou null
   */
  async findActive(): Promise<Diet | null> {
    return prisma.diet.findFirst({
      where: { isActive: true },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: {
            foods: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    }) as Promise<Diet | null>;
  }

  /**
   * Obtém uma dieta específica pelo ID incluindo toda a sua estrutura relacional.
   * 
   * @param id ID da dieta
   * @returns Dieta completa correspondente ou null
   */
  async findById(id: string): Promise<Diet | null> {
    return prisma.diet.findUnique({
      where: { id },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: {
            foods: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    }) as Promise<Diet | null>;
  }

  /**
   * Cria uma dieta e sua árvore de refeições de forma transacional.
   * Desativa as outras dietas se a nova for marcada como ativa.
   * 
   * @param data Entrada para a criação da dieta
   * @returns A dieta completa criada
   */
  async create(data: CreateDietInput): Promise<Diet> {
    return prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.diet.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const created = await tx.diet.create({
        data: {
          name: data.name,
          description: data.description,
          targetCalories: data.targetCalories,
          targetProtein: data.targetProtein,
          targetCarbs: data.targetCarbs,
          targetFat: data.targetFat,
          isActive: data.isActive,
          meals: {
            create: (data.meals || []).map((meal) => ({
              name: meal.name,
              order: meal.order,
              foods: {
                create: (meal.foods || []).map((food) => ({
                  foodId: food.foodId,
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  amount: food.amount,
                })),
              },
            })),
          },
        },
        include: {
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foods: {
                orderBy: { id: 'asc' },
              },
            },
          },
        },
      });

      return created as Diet;
    });
  }

  /**
   * Atualiza as informações da dieta e substitui as refeições antigas de forma transacional.
   * 
   * @param id ID da dieta a atualizar
   * @param data Novos dados e estrutura da dieta
   * @returns A dieta atualizada completa
   */
  async update(id: string, data: CreateDietInput): Promise<Diet> {
    return prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.diet.updateMany({
          where: {
            id: { not: id },
            isActive: true,
          },
          data: { isActive: false },
        });
      }

      // Deletar as refeições antigas vinculadas (o banco tratará os alimentos em cascata)
      await tx.meal.deleteMany({
        where: { dietId: id },
      });

      const updated = await tx.diet.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          targetCalories: data.targetCalories,
          targetProtein: data.targetProtein,
          targetCarbs: data.targetCarbs,
          targetFat: data.targetFat,
          isActive: data.isActive,
          meals: {
            create: (data.meals || []).map((meal) => ({
              name: meal.name,
              order: meal.order,
              foods: {
                create: (meal.foods || []).map((food) => ({
                  foodId: food.foodId,
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  amount: food.amount,
                })),
              },
            })),
          },
        },
        include: {
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foods: {
                orderBy: { id: 'asc' }
              },
            },
          },
        },
      });

      return updated as Diet;
    });
  }

  /**
   * Deleta uma dieta fisicamente do banco de dados (o cascade cuidará das dependências).
   * 
   * @param id ID da dieta
   */
  async delete(id: string): Promise<void> {
    await prisma.diet.delete({
      where: { id },
    });
  }

  /**
   * Ativa uma única dieta e desativa todas as outras em transação concorrente.
   * 
   * @param id ID da dieta a ser ativada
   * @returns Dieta ativada com seus relacionamentos carregados
   */
  async setActive(id: string): Promise<Diet> {
    return prisma.$transaction(async (tx) => {
      await tx.diet.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      const activated = await tx.diet.update({
        where: { id },
        data: { isActive: true },
        include: {
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foods: {
                orderBy: { id: 'asc' }
              }
            }
          }
        }
      });

      return activated as Diet;
    });
  }
}
