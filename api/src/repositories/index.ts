import { PrismaFoodRepository } from './prisma/prisma-food.repository.js';
import { PrismaDietRepository } from './prisma/prisma-diet.repository.js';

/**
 * Instância única e global do repositório de Alimentos a ser utilizada nos Use Cases.
 * 
 * @example
 * import { foodRepository } from '../repositories/index.js';
 * const foods = await foodRepository.search('ovo');
 */
export const foodRepository = new PrismaFoodRepository();

/**
 * Instância única e global do repositório de Dietas a ser utilizada nos Use Cases.
 * 
 * @example
 * import { dietRepository } from '../repositories/index.js';
 * const diet = await dietRepository.findActive();
 */
export const dietRepository = new PrismaDietRepository();
