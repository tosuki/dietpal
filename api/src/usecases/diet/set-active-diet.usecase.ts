import { IDietRepository } from '../../repositories/diet.repository.interface.js';
import { Diet } from '../../repositories/types.js';

/**
 * Caso de uso para ativar uma dieta e desativar todas as demais no sistema.
 * 
 * @example
 * const useCase = new SetActiveDietUseCase(dietRepository);
 * const updated = await useCase.execute('8c3b28d4-f5c8-47e2-89cd-438ac9da1234');
 */
export class SetActiveDietUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Valida a existência da dieta e a ativa transacionalmente.
   * 
   * @param id ID da dieta
   * @returns A dieta ativada
   * @throws Error se a dieta correspondente não for encontrada
   */
  async execute(id: string): Promise<Diet> {
    const existing = await this.dietRepository.findById(id);

    if (!existing) {
      throw new Error('Dieta não encontrada');
    }

    return this.dietRepository.setActive(id);
  }
}
