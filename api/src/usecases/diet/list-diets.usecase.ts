import { IDietRepository } from '../../repositories/diet.repository.interface.js';
import { Diet } from '../../repositories/types.js';

/**
 * Caso de uso para listar todas as dietas cadastradas.
 * 
 * @example
 * const useCase = new ListDietsUseCase(dietRepository);
 * const dietsList = await useCase.execute();
 */
export class ListDietsUseCase {
  /**
   * Inicializa o caso de uso.
   * 
   * @param dietRepository Repositório de dietas
   */
  constructor(private dietRepository: IDietRepository) {}

  /**
   * Obtém a lista rasa de todas as dietas registradas.
   * 
   * @returns Lista de dietas sem as refeições detalhadas
   */
  async execute(): Promise<Omit<Diet, 'meals'>[]> {
    return this.dietRepository.listAll();
  }
}
