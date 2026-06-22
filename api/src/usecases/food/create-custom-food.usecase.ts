import { IFoodRepository } from '../../repositories/food.repository.interface';
import { Food } from '../../repositories/types';

interface CreateCustomFoodInput {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Caso de uso para cadastrar um alimento customizado permanente na base de dados.
 * Impede duplicações de alimentos com o mesmo nome.
 * 
 * @example
 * const useCase = new CreateCustomFoodUseCase(foodRepository);
 * const food = await useCase.execute({
 *   name: 'Whey Protein Isolado',
 *   calories: 110,
 *   protein: 25,
 *   carbs: 2,
 *   fat: 0.5
 * });
 */
export class CreateCustomFoodUseCase {
  /**
   * Inicializa o caso de uso com o repositório de alimentos.
   * 
   * @param foodRepository Repositório de alimentos
   */
  constructor(private foodRepository: IFoodRepository) {}

  /**
   * Valida se o alimento já existe e, caso contrário, cria o alimento customizado.
   * 
   * @param data Dados do alimento customizado
   * @returns O alimento criado
   * @throws Error se o alimento com o nome já existir
   */
  async execute(data: CreateCustomFoodInput): Promise<Food> {
    const existing = await this.foodRepository.findByName(data.name);
    
    if (existing) {
      throw new Error('Já existe um alimento com este nome');
    }

    return this.foodRepository.createCustom(data);
  }
}
