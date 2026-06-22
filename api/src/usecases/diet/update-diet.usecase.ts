import { IDietRepository } from '../../repositories/diet.repository.interface';
import { Diet, CreateDietInput } from '../../repositories/types';

/**
 * Caso de uso para atualizar os dados de uma dieta e recalcular sua árvore de refeições associada.
 * 
 * @example
 * const useCase = new UpdateDietUseCase(dietRepository);
 * const updated = await useCase.execute('8c3b28d4-f5c8-47e2-89cd-438ac9da1234', {
 *   name: 'Bulk Atualizado',
 *   targetCalories: 3000
 * });
 */
export class UpdateDietUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Executa a atualização completa da dieta.
   * 
   * @param id ID da dieta
   * @param data Novos valores e refeições da dieta
   * @returns A dieta atualizada
   * @throws Error se a dieta correspondente não for encontrada
   */
  async execute(id: string, data: CreateDietInput): Promise<Diet> {
    const existing = await this.dietRepository.findById(id);

    if (!existing) {
      throw new Error('Dieta não encontrada');
    }

    return this.dietRepository.update(id, data);
  }
}
