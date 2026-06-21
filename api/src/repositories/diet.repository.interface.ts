import { Diet, CreateDietInput } from './types.js';

/**
 * Interface que define as operações de acesso a dados para a entidade Diet e suas tabelas relacionadas (Meal, MealFood).
 * 
 * @example
 * class MockDietRepository implements IDietRepository {
 *   async listAll() { return []; }
 *   async findActive() { return null; }
 *   async findById(id: string) { return null; }
 *   async create(data: any) { return {} as any; }
 *   async update(id: string, data: any) { return {} as any; }
 *   async delete(id: string) { return; }
 *   async setActive(id: string) { return {} as any; }
 * }
 */
export interface IDietRepository {
  /**
   * Lista todas as dietas cadastradas no banco, ordenadas pela data de atualização.
   * Não inclui a lista completa de refeições e alimentos (para listagem rápida).
   * 
   * @returns Lista de dietas (sem refeições)
   */
  listAll(): Promise<Omit<Diet, 'meals'>[]>;

  /**
   * Busca e retorna a única dieta marcada como ativa (`isActive: true`),
   * incluindo todas as suas refeições e os respectivos alimentos ordenados.
   * 
   * @returns A dieta ativa correspondente ou null
   */
  findActive(): Promise<Diet | null>;

  /**
   * Busca os detalhes completos de uma dieta específica pelo seu ID,
   * incluindo suas refeições e alimentos correspondentes.
   * 
   * @param id ID da dieta
   * @returns Dieta encontrada ou null
   */
  findById(id: string): Promise<Diet | null>;

  /**
   * Cria uma nova dieta completa com suas refeições e alimentos aninhados de forma transacional.
   * Se a nova dieta for definida como ativa (`isActive: true`), as outras dietas serão desativadas.
   * 
   * @param data Dados da dieta a ser criada
   * @returns A dieta criada
   */
  create(data: CreateDietInput): Promise<Diet>;

  /**
   * Atualiza os metadados de uma dieta e recria de forma transacional toda a árvore de refeições/alimentos
   * vinculada. Se marcada como ativa, garante a desativação das outras dietas.
   * 
   * @param id ID da dieta
   * @param data Novos dados da dieta
   * @returns A dieta atualizada
   */
  update(id: string, data: CreateDietInput): Promise<Diet>;

  /**
   * Exclui uma dieta do banco de dados pelo seu ID (causa deleção física ou cascade das refeições/alimentos).
   * 
   * @param id ID da dieta
   */
  delete(id: string): Promise<void>;

  /**
   * Define uma dieta como a única ativa do sistema, desativando as demais concorrentemente em uma transação.
   * 
   * @param id ID da dieta a ser ativada
   * @returns A dieta ativada atualizada
   */
  setActive(id: string): Promise<Diet>;
}
