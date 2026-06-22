import { IFoodRepository } from '../../repositories/food.repository.interface';

/**
 * Caso de uso para exclusão de um alimento customizado permanente.
 * Garante que apenas alimentos customizados criados pelo usuário possam ser removidos (bloqueando alimentos TACO).
 * 
 * @example
 * const useCase = new DeleteCustomFoodUseCase(foodRepository);
 * await useCase.execute('d3b07384-d113-4ec5-a5d9-43c3d2e0dc34');
 */
export class DeleteCustomFoodUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param foodRepository Repositório de alimentos
   */
  constructor(private foodRepository: IFoodRepository) {}

  /**
   * Valida a existência do alimento, verifica se é customizado, e então realiza a remoção.
   * 
   * @param id ID do alimento
   * @throws Error se o alimento não for encontrado ou se for um alimento fixo (TACO)
   */
  async execute(id: string): Promise<void> {
    const food = await this.foodRepository.findById(id);

    if (!food) {
      throw new Error('Alimento não encontrado');
    }

    if (!food.isCustom) {
      throw new Error('Não é possível excluir alimentos padrão da tabela TACO');
    }

    await this.foodRepository.deleteCustom(id);
  }
}
