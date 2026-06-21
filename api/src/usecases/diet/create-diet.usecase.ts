import { IDietRepository } from '../../repositories/diet.repository.interface.js';
import { Diet, CreateDietInput } from '../../repositories/types.js';

/**
 * Caso de uso para criar uma dieta e toda sua estrutura relacional.
 * 
 * @example
 * const useCase = new CreateDietUseCase(dietRepository);
 * const newDiet = await useCase.execute({
 *   name: 'Dieta Cutting',
 *   targetCalories: 1800,
 *   meals: [
 *     { name: 'Café', order: 0, foods: [] }
 *   ]
 * });
 */
export class CreateDietUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Executa a criação da dieta.
   * 
   * @param data Dados para a criação
   * @returns A dieta completa criada e ativa/inativa
   */
  async execute(data: CreateDietInput): Promise<Diet> {
    return this.dietRepository.create(data);
  }
}
