import { IFoodRepository } from '../../repositories/food.repository.interface';
import { Food } from '../../repositories/types';

/**
 * Caso de uso para pesquisa textual de alimentos (Tabela TACO e customizados).
 * 
 * @example
 * const useCase = new SearchFoodsUseCase(foodRepository);
 * const results = await useCase.execute('arroz');
 */
export class SearchFoodsUseCase {
  /**
   * Inicializa o caso de uso com a dependência necessária.
   * 
   * @param foodRepository Repositório de alimentos
   */
  constructor(private foodRepository: IFoodRepository) {}

  /**
   * Executa a pesquisa textual por alimentos.
   * 
   * @param query Termo de busca
   * @returns Lista de alimentos correspondentes
   */
  async execute(query: string): Promise<Food[]> {
    return this.foodRepository.search(query);
  }
}
