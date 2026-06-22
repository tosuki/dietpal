import { IDietRepository } from '../../repositories/diet.repository.interface';

/**
 * Caso de uso para a exclusão definitiva de uma dieta do catálogo.
 * 
 * @example
 * const useCase = new DeleteDietUseCase(dietRepository);
 * await useCase.execute('8c3b28d4-f5c8-47e2-89cd-438ac9da1234');
 */
export class DeleteDietUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Valida se a dieta existe e realiza a exclusão.
   * 
   * @param id ID da dieta
   * @throws Error se a dieta não for encontrada
   */
  async execute(id: string): Promise<void> {
    const existing = await this.dietRepository.findById(id);

    if (!existing) {
      throw new Error('Dieta não encontrada');
    }

    await this.dietRepository.delete(id);
  }
}
