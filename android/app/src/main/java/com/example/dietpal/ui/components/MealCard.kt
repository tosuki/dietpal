package com.example.dietpal.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.dietpal.data.model.Meal
import com.example.dietpal.data.model.MealFood
import com.example.dietpal.ui.theme.*

@Composable
fun MealCard(
    meal: Meal,
    onRenameMeal: (String) -> Unit,
    onRenameMealBlur: () -> Unit,
    onAddFoodClick: () -> Unit,
    onDuplicateMeal: () -> Unit,
    onDeleteMeal: () -> Unit,
    onUpdateFoodAmount: (foodIndex: Int, value: String) -> Unit,
    onUpdateFoodAmountBlur: (foodIndex: Int) -> Unit,
    onRemoveFood: (foodIndex: Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val focusManager = LocalFocusManager.current
    var tempMealName by remember(meal.name) { mutableStateOf(meal.name) }

    // Calcular totais da refeição
    var mealCal = 0.0
    var mealProt = 0.0
    var mealCarb = 0.0
    var mealFat = 0.0

    meal.foods.forEach { f ->
        mealCal += f.calories
        mealProt += f.protein
        mealCarb += f.carbs
        mealFat += f.fat
    }

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = Color.White,
        border = BorderStroke(1.dp, CardBorder),
        shadowElevation = 1.dp,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header da Refeição
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
            ) {
                // Nome editável da Refeição
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(BgColor, RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    BasicTextField(
                        value = tempMealName,
                        onValueChange = {
                            tempMealName = it
                            onRenameMeal(it)
                        },
                        textStyle = TextStyle(
                            color = TextMain,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        keyboardOptions = KeyboardOptions(
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                focusManager.clearFocus()
                                onRenameMealBlur()
                            }
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .onFocusChanged { focusState ->
                                if (!focusState.isFocused) {
                                    onRenameMealBlur()
                                }
                            }
                    )
                    if (tempMealName.isEmpty()) {
                        Text(
                            text = "Nome da refeição",
                            color = TextMuted,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Ações da Refeição
                TextButton(
                    onClick = onAddFoodClick,
                    colors = ButtonDefaults.textButtonColors(contentColor = Primary),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                IconButton(
                    onClick = onDuplicateMeal,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.ContentCopy,
                        contentDescription = "Duplicar Refeição",
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                }

                IconButton(
                    onClick = onDeleteMeal,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Excluir Refeição",
                        tint = RedAccent,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            HorizontalDivider(color = CardBorder, thickness = 1.dp)

            // Lista de Alimentos
            if (meal.foods.isEmpty()) {
                Text(
                    text = "Nenhum alimento nesta refeição. Clique em \"Add\" para montar.",
                    color = TextMuted,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp)
                )
            } else {
                Spacer(modifier = Modifier.height(8.dp))
                
                meal.foods.forEachIndexed { foodIdx, food ->
                    FoodItemRow(
                        food = food,
                        onAmountChange = { newVal -> onUpdateFoodAmount(foodIdx, newVal) },
                        onAmountBlur = { onUpdateFoodAmountBlur(foodIdx) },
                        onRemove = { onRemoveFood(foodIdx) }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Resumo de Macronutrientes da Refeição
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BgColor, RoundedCornerShape(6.dp))
                        .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TOTAL REFEIÇÃO",
                        color = TextMuted,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "${Math.round(mealCal)} kcal",
                            color = TextMain,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${String.format("%.1f", mealProt)}g P",
                            color = TextMuted,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${String.format("%.1f", mealCarb)}g C",
                            color = TextMuted,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${String.format("%.1f", mealFat)}g G",
                            color = TextMuted,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FoodItemRow(
    food: MealFood,
    onAmountChange: (String) -> Unit,
    onAmountBlur: () -> Unit,
    onRemove: () -> Unit
) {
    val focusManager = LocalFocusManager.current
    // Mantém estado local do input para não dessincronizar digitação rápida
    var textAmount by remember(food.amount) { mutableStateOf(if (food.amount == 0.0) "" else "${Math.round(food.amount)}") }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = food.name,
                color = TextMain,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            // Resumo de macros do alimento
            Text(
                text = "${Math.round(food.calories)} kcal | P: ${String.format("%.1f", food.protein)}g | C: ${String.format("%.1f", food.carbs)}g | G: ${String.format("%.1f", food.fat)}g",
                color = TextMuted,
                fontSize = 11.sp
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Input de quantidade
        BasicTextField(
            value = textAmount,
            onValueChange = { newVal ->
                val clean = newVal.replace(',', '.')
                if (clean.isEmpty() || clean.toDoubleOrNull() != null || clean == ".") {
                    textAmount = clean
                    onAmountChange(clean)
                }
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
                onDone = {
                    focusManager.clearFocus()
                    onAmountBlur()
                }
            ),
            singleLine = true,
            textStyle = TextStyle(
                color = TextMain,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            ),
            modifier = Modifier
                .width(60.dp)
                .background(Color.White, RoundedCornerShape(4.dp))
                .border(1.dp, CardBorder, RoundedCornerShape(4.dp))
                .padding(horizontal = 6.dp, vertical = 6.dp)
                .onFocusChanged { focusState ->
                    if (!focusState.isFocused) {
                        onAmountBlur()
                    }
                }
        )

        Text(
            text = "g",
            color = TextMuted,
            fontSize = 13.sp,
            modifier = Modifier.padding(start = 4.dp, end = 8.dp)
        )

        IconButton(
            onClick = onRemove,
            modifier = Modifier.size(24.dp)
        ) {
            Icon(
                Icons.Default.Close,
                contentDescription = "Remover Alimento",
                tint = TextMuted,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}
