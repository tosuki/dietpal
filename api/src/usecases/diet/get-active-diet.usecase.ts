import { IDietRepository } from '../../repositories/diet.repository.interface.js';
import { Diet } from '../../repositories/types.js';

/**
 * Caso de uso para obter a única dieta marcada como ativa no momento.
 * 
 * @example
 * const useCase = new GetActiveDietUseCase(dietRepository);
 * const activeDiet = await useCase.execute();
 */
export class GetActiveDietUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Executa a busca pela dieta ativa.
   * 
   * @returns A dieta ativa incluindo todas as refeições e alimentos, ou null
   */
  async execute(): Promise<Diet | null> {
    return this.dietRepository.findActive();
  }
}
