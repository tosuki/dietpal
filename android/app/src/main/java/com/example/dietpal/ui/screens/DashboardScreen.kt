package com.example.dietpal.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.window.Dialog
import com.example.dietpal.data.repository.DietPalRepositoryProvider
import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Meal
import com.example.dietpal.data.model.MealFood
import com.example.dietpal.ui.components.*
import com.example.dietpal.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    showToastMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val repository = remember(context) { DietPalRepositoryProvider.getRepository(context) }
    val coroutineScope = rememberCoroutineScope()

    // Estados locais da dieta ativa
    var activeDiet by remember { mutableStateOf<Diet?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var isError by remember { mutableStateOf(false) }
    var isSaving by remember { mutableStateOf(false) }

    // Estados para controle de modais
    var isEditingTargets by remember { mutableStateOf(false) }
    var selectedMealIndexForAddFood by remember { mutableStateOf<Int?>(null) }
    var mealToDeleteIndex by remember { mutableStateOf<Int?>(null) }

    // Estados do formulário de metas
    var targetFormName by remember { mutableStateOf("") }
    var targetFormDesc by remember { mutableStateOf("") }
    var targetFormCal by remember { mutableStateOf("") }
    var targetFormProt by remember { mutableStateOf("") }
    var targetFormCarb by remember { mutableStateOf("") }
    var targetFormFat by remember { mutableStateOf("") }

    // Carregar dieta ativa inicial
    fun loadActiveDiet() {
        coroutineScope.launch {
            isLoading = true
            isError = false
            try {
                val diet = repository.getActiveDiet()
                activeDiet = diet
                diet?.let {
                    targetFormName = it.name
                    targetFormDesc = it.description ?: ""
                    targetFormCal = "${Math.round(it.targetCalories)}"
                    targetFormProt = "${Math.round(it.targetProtein)}"
                    targetFormCarb = "${Math.round(it.targetCarbs)}"
                    targetFormFat = "${Math.round(it.targetFat)}"
                }
            } catch (e: Exception) {
                isError = true
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadActiveDiet()
    }

    // Função de Autosave otimizada
    fun saveDiet(updatedDiet: Diet) {
        activeDiet = updatedDiet
        coroutineScope.launch {
            isSaving = true
            try {
                val saved = repository.updateDiet(updatedDiet.id!!, updatedDiet)
                activeDiet = saved
            } catch (e: Exception) {
                showToastMessage(e.message ?: "Falha ao salvar dieta no servidor.")
                // Recarrega do servidor em caso de falha
                val current = repository.getActiveDiet()
                activeDiet = current
            } finally {
                isSaving = false
            }
        }
    }

    // Cálculos de consumo total atual da dieta ativa
    var totalCalories = 0.0
    var totalProtein = 0.0
    var totalCarbs = 0.0
    var totalFat = 0.0

    activeDiet?.meals?.forEach { meal ->
        meal.foods.forEach { food ->
            totalCalories += food.calories
            totalProtein += food.protein
            totalCarbs += food.carbs
            totalFat += food.fat
        }
    }

    if (isLoading) {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Primary)
        }
        return
    }

    if (isError) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Erro de Conexão com o Servidor", color = RedAccent, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Não foi possível se comunicar com o backend do DietaPal.", color = TextMuted, fontSize = 14.sp, textAlign = TextAlign.Center)
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { loadActiveDiet() },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text("Tentar Novamente")
                }
            }
        }
        return
    }

    if (activeDiet == null) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Nenhuma dieta ativa", color = TextMain, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Você precisa ativar ou criar uma dieta no catálogo para começar.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
        return
    }

    val diet = activeDiet!!

    // Tela Principal
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = diet.name,
                        color = TextMain,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    
                    Surface(
                        color = GreenGlow,
                        border = BorderStroke(1.dp, GreenBorder),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.padding(horizontal = 8.dp)
                    ) {
                        Text(
                            text = "ATIVADA",
                            color = GreenAccent,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    
                    if (isSaving) {
                        Text(
                            text = "Salvando...",
                            color = TextMuted,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                }
                
                diet.description?.let {
                    Text(
                        text = it,
                        color = TextMuted,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                    )
                }

                Button(
                    onClick = { isEditingTargets = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = TextMain
                    ),
                    shape = RoundedCornerShape(6.dp),
                    border = BorderStroke(1.dp, CardBorder),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                ) {
                    Text("Ajustar Metas e Nome", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                }
            }
        }

        // Macro Cards Grid (Exibe 4 metas)
        item {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    MacroCard(
                        title = "Calorias",
                        current = totalCalories,
                        target = diet.targetCalories,
                        unit = "kcal",
                        modifier = Modifier.weight(1f)
                    )
                    MacroCard(
                        title = "Proteínas",
                        current = totalProtein,
                        target = diet.targetProtein,
                        unit = "g",
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    MacroCard(
                        title = "Carboidratos",
                        current = totalCarbs,
                        target = diet.targetCarbs,
                        unit = "g",
                        modifier = Modifier.weight(1f)
                    )
                    MacroCard(
                        title = "Gorduras",
                        current = totalFat,
                        target = diet.targetFat,
                        unit = "g",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Seção Refeições Title
        item {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
            ) {
                Text(
                    text = "Estrutura de Refeições",
                    color = TextMain,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Button(
                    onClick = {
                        val newMealName = "Refeição ${diet.meals.size + 1}"
                        val updatedMeals = diet.meals.toMutableList().apply {
                            add(Meal(name = newMealName, order = size, foods = emptyList()))
                        }
                        saveDiet(diet.copy(meals = updatedMeals))
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("Nova Refeição", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Listagem de Refeições
        if (diet.meals.isEmpty()) {
            item {
                Surface(
                    color = CardBg,
                    border = BorderStroke(1.dp, CardBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Text(
                        text = "Nenhuma refeição adicionada. Toque em \"Nova Refeição\" para estruturar.",
                        color = TextMuted,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp)
                    )
                }
            }
        } else {
            itemsIndexed(diet.meals) { mealIdx, meal ->
                MealCard(
                    meal = meal,
                    onRenameMeal = { newName ->
                        val updatedMeals = diet.meals.toMutableList()
                        updatedMeals[mealIdx] = meal.copy(name = newName)
                        activeDiet = diet.copy(meals = updatedMeals)
                    },
                    onRenameMealBlur = {
                        val updatedMeals = diet.meals.toMutableList()
                        var nameVal = updatedMeals[mealIdx].name
                        if (nameVal.trim().isEmpty()) {
                            nameVal = "Refeição ${mealIdx + 1}"
                        }
                        updatedMeals[mealIdx] = meal.copy(name = nameVal)
                        saveDiet(diet.copy(meals = updatedMeals))
                    },
                    onAddFoodClick = {
                        selectedMealIndexForAddFood = mealIdx
                    },
                    onDuplicateMeal = {
                        val duplicated = meal.copy(
                            id = null,
                            name = "${meal.name} (Cópia)",
                            order = diet.meals.size,
                            foods = meal.foods.map { it.copy(id = null) }
                        )
                        val updatedMeals = diet.meals.toMutableList().apply {
                            add(duplicated)
                        }
                        saveDiet(diet.copy(meals = updatedMeals))
                    },
                    onDeleteMeal = {
                        mealToDeleteIndex = mealIdx
                    },
                    onUpdateFoodAmount = { foodIdx, newVal ->
                        val updatedMeals = diet.meals.toMutableList()
                        val m = updatedMeals[mealIdx]
                        val updatedFoods = m.foods.toMutableList()
                        val f = updatedFoods[foodIdx]
                        
                        val amountVal = newVal.replace(',', '.').toDoubleOrNull() ?: 0.0
                        val updatedFood = f.recalculateForAmount(amountVal)
                        
                        updatedFoods[foodIdx] = updatedFood
                        updatedMeals[mealIdx] = m.copy(foods = updatedFoods)
                        activeDiet = diet.copy(meals = updatedMeals)
                    },
                    onUpdateFoodAmountBlur = { foodIdx ->
                        val updatedMeals = diet.meals.toMutableList()
                        val m = updatedMeals[mealIdx]
                        val updatedFoods = m.foods.toMutableList()
                        var f = updatedFoods[foodIdx]
                        
                        if (f.amount <= 0.0) {
                            f = f.recalculateForAmount(100.0)
                            updatedFoods[foodIdx] = f
                            updatedMeals[mealIdx] = m.copy(foods = updatedFoods)
                        }
                        
                        saveDiet(diet.copy(meals = updatedMeals))
                    },
                    onRemoveFood = { foodIdx ->
                        val updatedMeals = diet.meals.toMutableList()
                        val m = updatedMeals[mealIdx]
                        val updatedFoods = m.foods.toMutableList().apply {
                            removeAt(foodIdx)
                        }
                        updatedMeals[mealIdx] = m.copy(foods = updatedFoods)
                        saveDiet(diet.copy(meals = updatedMeals))
                    }
                )
            }
        }
    }

    // Modal: Confirmar Exclusão de Refeição
    mealToDeleteIndex?.let { mealIdx ->
        CustomDialog(
            title = "Excluir Refeição",
            message = "Deseja realmente excluir esta refeição inteira e todos os seus alimentos?",
            confirmText = "Confirmar",
            cancelText = "Cancelar",
            onConfirm = {
                val updatedMeals = diet.meals.toMutableList().apply {
                    removeAt(mealIdx)
                }
                // Ajustar ordem das refeições
                updatedMeals.forEachIndexed { index, m ->
                    updatedMeals[index] = m.copy(order = index)
                }
                saveDiet(diet.copy(meals = updatedMeals))
                mealToDeleteIndex = null
            },
            onCancel = {
                mealToDeleteIndex = null
            }
        )
    }

    // Modal: Adicionar Alimento
    selectedMealIndexForAddFood?.let { mealIdx ->
        AddFoodDialog(
            onDismissRequest = { selectedMealIndexForAddFood = null },
            onAddFood = { food, amount ->
                val updatedMeals = diet.meals.toMutableList()
                val m = updatedMeals[mealIdx]
                
                val factor = amount / 100.0
                val newFood = MealFood(
                    foodId = food.id,
                    name = food.name,
                    amount = amount,
                    calories = Math.round(food.calories * factor * 10.0) / 10.0,
                    protein = Math.round(food.protein * factor * 100.0) / 100.0,
                    carbs = Math.round(food.carbs * factor * 100.0) / 100.0,
                    fat = Math.round(food.fat * factor * 100.0) / 100.0,
                    baseCalories = food.calories,
                    baseProtein = food.protein,
                    baseCarbs = food.carbs,
                    baseFat = food.fat
                )
                
                val updatedFoods = m.foods.toMutableList().apply {
                    add(newFood)
                }
                updatedMeals[mealIdx] = m.copy(foods = updatedFoods)
                
                saveDiet(diet.copy(meals = updatedMeals))
                selectedMealIndexForAddFood = null
            },
            showToastMessage = showToastMessage
        )
    }

    // Modal: Ajustar Metas e Detalhes da Dieta
    if (isEditingTargets) {
        Dialog(onDismissRequest = { isEditingTargets = false }) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color.White,
                border = BorderStroke(1.dp, CardBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = "Ajustar Metas e Detalhes",
                        color = TextMain,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    HorizontalDivider(color = CardBorder, thickness = 1.dp, modifier = Modifier.padding(bottom = 16.dp))

                    OutlinedTextField(
                        value = targetFormName,
                        onValueChange = { targetFormName = it },
                        label = { Text("Nome da Dieta") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = targetFormDesc,
                        onValueChange = { targetFormDesc = it },
                        label = { Text("Descrição") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = targetFormCal,
                        onValueChange = { targetFormCal = it },
                        label = { Text("Meta de Calorias (kcal)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
                    ) {
                        OutlinedTextField(
                            value = targetFormProt,
                            onValueChange = { targetFormProt = it },
                            label = { Text("Prot (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = targetFormCarb,
                            onValueChange = { targetFormCarb = it },
                            label = { Text("Carb (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = targetFormFat,
                            onValueChange = { targetFormFat = it },
                            label = { Text("Gord (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Footer
                    Row(
                        horizontalArrangement = Arrangement.End,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TextButton(
                            onClick = { isEditingTargets = false },
                            colors = ButtonDefaults.textButtonColors(contentColor = TextMain),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text("Cancelar", fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = {
                                if (targetFormName.trim().isEmpty()) {
                                    showToastMessage("Nome da dieta é obrigatório")
                                    return@Button
                                }
                                val updated = diet.copy(
                                    name = targetFormName,
                                    description = targetFormDesc.ifEmpty { null },
                                    targetCalories = targetFormCal.toDoubleOrNull() ?: 2000.0,
                                    targetProtein = targetFormProt.toDoubleOrNull() ?: 150.0,
                                    targetCarbs = targetFormCarb.toDoubleOrNull() ?: 200.0,
                                    targetFat = targetFormFat.toDoubleOrNull() ?: 70.0
                                )
                                saveDiet(updated)
                                isEditingTargets = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Primary),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Confirmar Metas", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}
