package com.example.dietpal.data.repository

import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Food

interface DietPalRepository {
    suspend fun getFoods(query: String? = null): List<Food>
    suspend fun createCustomFood(name: String, calories: Double, protein: Double, carbs: Double, fat: Double): Food
    suspend fun deleteCustomFood(id: String): Boolean
    suspend fun getDiets(): List<Diet>
    suspend fun getActiveDiet(): Diet?
    suspend fun getDietDetails(id: String): Diet
    suspend fun createDiet(diet: Diet): Diet
    suspend fun updateDiet(id: String, diet: Diet): Diet
    suspend fun activateDiet(id: String): Diet
    suspend fun deleteDiet(id: String): Boolean
}
