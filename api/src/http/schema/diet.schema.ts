import { z } from "zod"

// Schemas Zod para validação da requisição
export const mealFoodInputSchema = z.object({
  foodId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Nome do alimento é obrigatório'),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  amount: z.number().positive('Quantidade deve ser maior que zero'),
});

export const mealInputSchema = z.object({
  name: z.string().min(1, 'Nome da refeição é obrigatório'),
  order: z.number().int(),
  foods: z.array(mealFoodInputSchema),
});

export const dietInputSchema = z.object({
  name: z.string().min(1, 'Nome da dieta é obrigatório'),
  description: z.string().optional().nullable(),
  targetCalories: z.number().nonnegative().default(2000),
  targetProtein: z.number().nonnegative().default(150),
  targetCarbs: z.number().nonnegative().default(200),
  targetFat: z.number().nonnegative().default(70),
  isActive: z.boolean().default(false),
  meals: z.array(mealInputSchema).default([]),
});