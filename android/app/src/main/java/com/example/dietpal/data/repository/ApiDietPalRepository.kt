package com.example.dietpal.data.repository

import com.example.dietpal.data.api.DietPalApiService
import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Food

class ApiDietPalRepository : DietPalRepository {
    override suspend fun getFoods(query: String?): List<Food> {
        return DietPalApiService.getFoods(query)
    }

    override suspend fun createCustomFood(
        name: String,
        calories: Double,
        protein: Double,
        carbs: Double,
        fat: Double
    ): Food {
        return DietPalApiService.createCustomFood(name, calories, protein, carbs, fat)
    }

    override suspend fun deleteCustomFood(id: String): Boolean {
        return DietPalApiService.deleteCustomFood(id)
    }

    override suspend fun getDiets(): List<Diet> {
        return DietPalApiService.getDiets()
    }

    override suspend fun getActiveDiet(): Diet? {
        return DietPalApiService.getActiveDiet()
    }

    override suspend fun getDietDetails(id: String): Diet {
        return DietPalApiService.getDietDetails(id)
    }

    override suspend fun createDiet(diet: Diet): Diet {
        return DietPalApiService.createDiet(diet)
    }

    override suspend fun updateDiet(id: String, diet: Diet): Diet {
        return DietPalApiService.updateDiet(id, diet)
    }

    override suspend fun activateDiet(id: String): Diet {
        return DietPalApiService.activateDiet(id)
    }

    override suspend fun deleteDiet(id: String): Boolean {
        return DietPalApiService.deleteDiet(id)
    }
}
