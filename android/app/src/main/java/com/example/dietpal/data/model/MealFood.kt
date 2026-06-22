package com.example.dietpal.data.model

data class MealFood(
    val id: String? = null,
    val foodId: String? = null,
    val name: String,
    val calories: Double,
    val protein: Double,
    val carbs: Double,
    val fat: Double,
    val amount: Double,
    val baseCalories: Double? = null,
    val baseProtein: Double? = null,
    val baseCarbs: Double? = null,
    val baseFat: Double? = null
) {
    val finalBaseCalories: Double
        get() = baseCalories ?: if (amount > 0) (calories / amount) * 100.0 else calories

    val finalBaseProtein: Double
        get() = baseProtein ?: if (amount > 0) (protein / amount) * 100.0 else protein

    val finalBaseCarbs: Double
        get() = baseCarbs ?: if (amount > 0) (carbs / amount) * 100.0 else carbs

    val finalBaseFat: Double
        get() = baseFat ?: if (amount > 0) (fat / amount) * 100.0 else fat

    fun recalculateForAmount(newAmount: Double): MealFood {
        val factor = newAmount / 100.0
        return copy(
            amount = newAmount,
            calories = Math.round(finalBaseCalories * factor * 10.0) / 10.0,
            protein = Math.round(finalBaseProtein * factor * 100.0) / 100.0,
            carbs = Math.round(finalBaseCarbs * factor * 100.0) / 100.0,
            fat = Math.round(finalBaseFat * factor * 100.0) / 100.0,
            baseCalories = finalBaseCalories,
            baseProtein = finalBaseProtein,
            baseCarbs = finalBaseCarbs,
            baseFat = finalBaseFat
        )
    }
}
