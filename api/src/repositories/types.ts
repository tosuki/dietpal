/**
 * Representa um alimento na base de dados (Tabela TACO ou Customizado).
 * 
 * @example
 * const food: Food = {
 *   id: "d3b07384-d113-4ec5-a5d9-43c3d2e0dc34",
 *   name: "Banana Nanica",
 *   calories: 92,
 *   protein: 1.4,
 *   carbs: 23.8,
 *   fat: 0.1,
 *   isCustom: false,
 *   createdAt: new Date()
 * };
 */
export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom: boolean;
  createdAt: Date;
}

/**
 * Representa um alimento registrado dentro de uma refeição específica com a sua respectiva porção em gramas.
 * 
 * @example
 * const mealFood: MealFood = {
 *   id: "d9e847c2-19bc-4318-971a-28941da7bc12",
 *   foodId: "d3b07384-d113-4ec5-a5d9-43c3d2e0dc34",
 *   name: "Banana Nanica",
 *   calories: 138,
 *   protein: 2.1,
 *   carbs: 35.7,
 *   fat: 0.15,
 *   amount: 150
 * };
 */
export interface MealFood {
  id: string;
  foodId: string | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
}

/**
 * Representa uma refeição da dieta contendo vários alimentos.
 * 
 * @example
 * const meal: Meal = {
 *   id: "a762d184-c8c3-42e5-829d-43d928c0dc11",
 *   name: "Café da Manhã",
 *   order: 0,
 *   foods: [mealFood]
 * };
 */
export interface Meal {
  id: string;
  name: string;
  order: number;
  foods: MealFood[];
}

/**
 * Representa uma dieta contendo metas diárias de macronutrientes, status de ativação e a estrutura de refeições.
 * 
 * @example
 * const diet: Diet = {
 *   id: "8c3b28d4-f5c8-47e2-89cd-438ac9da1234",
 *   name: "Dieta Bulk Limpo",
 *   description: "Foco em ganho de massa muscular magra",
 *   targetCalories: 2800,
 *   targetProtein: 180,
 *   targetCarbs: 350,
 *   targetFat: 80,
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   meals: [meal]
 * };
 */
export interface Diet {
  id: string;
  name: string;
  description: string | null;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals: Meal[];
}

/**
 * Tipo de dados de entrada para a criação ou atualização de uma dieta.
 */
export interface CreateDietInput {
  name: string;
  description?: string | null;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  isActive?: boolean;
  meals?: CreateMealInput[];
}

/**
 * Tipo de dados de entrada para criação ou atualização de refeição vinculada a uma dieta.
 */
export interface CreateMealInput {
  name: string;
  order: number;
  foods: CreateMealFoodInput[];
}

/**
 * Tipo de dados de entrada para criação ou atualização de alimento dentro de uma refeição.
 */
export interface CreateMealFoodInput {
  foodId?: string | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
}
