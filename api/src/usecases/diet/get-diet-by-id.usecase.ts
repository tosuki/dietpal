import { IDietRepository } from '../../repositories/diet.repository.interface.js';
import { Diet } from '../../repositories/types.js';

/**
 * Caso de uso para obter os detalhes completos de uma dieta pelo seu ID único.
 * 
 * @example
 * const useCase = new GetDietByIdUseCase(dietRepository);
 * const diet = await useCase.execute('8c3b28d4-f5c8-47e2-89cd-438ac9da1234');
 */
export class GetDietByIdUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Executa a busca pelos detalhes da dieta.
   * 
   * @param id ID único da dieta
   * @returns A dieta encontrada ou null
   */
  async execute(id: string): Promise<Diet | null> {
    return this.dietRepository.findById(id);
  }
}
