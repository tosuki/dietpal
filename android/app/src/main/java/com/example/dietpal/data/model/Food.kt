package com.example.dietpal.data.model

data class Food(
    val id: String,
    val name: String,
    val calories: Double, // Per 100g
    val protein: Double,  // Per 100g
    val carbs: Double,    // Per 100g
    val fat: Double,      // Per 100g
    val isCustom: Boolean = false
)
