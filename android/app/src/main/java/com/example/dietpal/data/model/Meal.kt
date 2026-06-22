package com.example.dietpal.data.model

data class Meal(
    val id: String? = null,
    val name: String,
    val order: Int,
    val foods: List<MealFood> = emptyList()
)
