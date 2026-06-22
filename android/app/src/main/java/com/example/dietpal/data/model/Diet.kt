package com.example.dietpal.data.model

data class Diet(
    val id: String? = null,
    val name: String,
    val description: String? = null,
    val targetCalories: Double = 2000.0,
    val targetProtein: Double = 150.0,
    val targetCarbs: Double = 200.0,
    val targetFat: Double = 70.0,
    val isActive: Boolean = false,
    val meals: List<Meal> = emptyList()
)
