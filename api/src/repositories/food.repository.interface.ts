import { Food } from './types';

/**
 * Interface que define as operações de acesso a dados para a entidade Food.
 * 
 * @example
 * class MockFoodRepository implements IFoodRepository {
 *   async search(query: string) { return []; }
 *   async findByName(name: string) { return null; }
 *   async findById(id: string) { return null; }
 *   async createCustom(data: any) { return {} as any; }
 *   async deleteCustom(id: string) { return; }
 * }
 */
export interface IFoodRepository {
  /**
   * Realiza uma busca textual por alimentos na base de dados (Tabela TACO ou Customizado).
   * 
   * @param query Termo de busca
   * @returns Lista de alimentos correspondentes
   */
  search(query: string): Promise<Food[]>;

  /**
   * Busca um alimento específico pelo nome exato.
   * 
   * @param name Nome exato do alimento
   * @returns O alimento correspondente ou null
   */
  findByName(name: string): Promise<Food | null>;

  /**
   * Busca um alimento específico por seu ID único.
   * 
   * @param id ID do alimento
   * @returns O alimento correspondente ou null
   */
  findById(id: string): Promise<Food | null>;

  /**
   * Cadastra um alimento customizado permanente para buscas futuras.
   * 
   * @param data Dados do alimento customizado
   * @returns O alimento criado
   */
  createCustom(data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<Food>;

  /**
   * Remove um alimento customizado da base de dados pelo seu ID.
   * 
   * @param id ID do alimento customizado
   */
  deleteCustom(id: string): Promise<void>;
}
