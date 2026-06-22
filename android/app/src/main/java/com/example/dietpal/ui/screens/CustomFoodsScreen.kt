package com.example.dietpal.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
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
import androidx.compose.ui.window.Dialog
import com.example.dietpal.data.api.DietPalApiService
import com.example.dietpal.data.model.Food
import com.example.dietpal.ui.components.CustomDialog
import com.example.dietpal.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomFoodsScreen(
    showToastMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()

    // Estados
    var foods by remember { mutableStateOf<List<Food>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isError by remember { mutableStateOf(false) }

    var isCreateDialogOpen by remember { mutableStateOf(false) }
    var foodToDelete by remember { mutableStateOf<Food?>(null) }

    // Estados do formulário de novo alimento
    var foodName by remember { mutableStateOf("") }
    var foodCalories by remember { mutableStateOf("100") }
    var foodProtein by remember { mutableStateOf("10") }
    var foodCarbs by remember { mutableStateOf("10") }
    var foodFat by remember { mutableStateOf("2") }

    fun loadCustomFoods() {
        coroutineScope.launch {
            isLoading = true
            isError = false
            try {
                // Carrega todos os alimentos e filtra apenas os customizados
                val allFoods = DietPalApiService.getFoods()
                foods = allFoods.filter { it.isCustom }
            } catch (e: Exception) {
                isError = true
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadCustomFoods()
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
                Text("Erro de Conexão", color = RedAccent, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Não foi possível carregar a lista de alimentos customizados.", color = TextMuted, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = { loadCustomFoods() }, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
                    Text("Recarregar")
                }
            }
        }
        return
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Meus Alimentos",
                    color = TextMain,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Gerencie seus alimentos personalizados adicionados no catálogo.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                )

                Button(
                    onClick = { isCreateDialogOpen = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Novo Alimento Customizado", fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Listagem de Alimentos
        if (foods.isEmpty()) {
            item {
                Surface(
                    color = CardBg,
                    border = BorderStroke(1.dp, CardBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp)
                ) {
                    Text(
                        text = "Nenhum alimento customizado cadastrado ainda.",
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
            items(foods) { food ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White,
                    border = BorderStroke(1.dp, CardBorder),
                    shadowElevation = 1.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = food.name,
                                color = TextMain,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${Math.round(food.calories)} kcal | P: ${String.format("%.1f", food.protein)}g | C: ${String.format("%.1f", food.carbs)}g | G: ${String.format("%.1f", food.fat)}g (por 100g)",
                                color = TextMuted,
                                fontSize = 13.sp
                            )
                        }

                        IconButton(
                            onClick = { foodToDelete = food },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "Remover Alimento",
                                tint = RedAccent,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    // Modal de Criação de Alimento Customizado
    if (isCreateDialogOpen) {
        Dialog(onDismissRequest = { isCreateDialogOpen = false }) {
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
                ) {
                    Text(
                        text = "Novo Alimento Customizado",
                        color = TextMain,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    HorizontalDivider(color = CardBorder, thickness = 1.dp, modifier = Modifier.padding(bottom = 16.dp))

                    OutlinedTextField(
                        value = foodName,
                        onValueChange = { foodName = it },
                        label = { Text("Nome do Alimento") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = foodCalories,
                        onValueChange = { foodCalories = it },
                        label = { Text("Calorias (por 100g)") },
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
                            value = foodProtein,
                            onValueChange = { foodProtein = it },
                            label = { Text("Prot (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = foodCarbs,
                            onValueChange = { foodCarbs = it },
                            label = { Text("Carb (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = foodFat,
                            onValueChange = { foodFat = it },
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
                            onClick = { isCreateDialogOpen = false },
                            colors = ButtonDefaults.textButtonColors(contentColor = TextMain),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text("Cancelar", fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = {
                                if (foodName.trim().isEmpty()) {
                                    showToastMessage("Nome do alimento é obrigatório")
                                    return@Button
                                }
                                coroutineScope.launch {
                                    try {
                                        DietPalApiService.createCustomFood(
                                            name = foodName,
                                            calories = foodCalories.toDoubleOrNull() ?: 100.0,
                                            protein = foodProtein.toDoubleOrNull() ?: 10.0,
                                            carbs = foodCarbs.toDoubleOrNull() ?: 10.0,
                                            fat = foodFat.toDoubleOrNull() ?: 2.0
                                        )
                                        showToastMessage("Alimento criado com sucesso!")
                                        
                                        // Reset formulário
                                        foodName = ""
                                        foodCalories = "100"
                                        foodProtein = "10"
                                        foodCarbs = "10"
                                        foodFat = "2"
                                        
                                        isCreateDialogOpen = false
                                        loadCustomFoods()
                                    } catch (e: Exception) {
                                        showToastMessage(e.message ?: "Erro ao criar alimento.")
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Primary),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Criar Alimento", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }

    // Modal de Confirmação de Exclusão
    foodToDelete?.let { food ->
        CustomDialog(
            title = "Excluir Alimento",
            message = "Deseja realmente remover o alimento \"${food.name}\" do catálogo permanentemente?",
            confirmText = "Confirmar",
            cancelText = "Cancelar",
            onConfirm = {
                coroutineScope.launch {
                    try {
                        DietPalApiService.deleteCustomFood(food.id)
                        showToastMessage("Alimento removido do catálogo.")
                        loadCustomFoods()
                    } catch (e: Exception) {
                        showToastMessage("Erro ao excluir alimento.")
                    } finally {
                        foodToDelete = null
                    }
                }
            },
            onCancel = {
                foodToDelete = null
            }
        )
    }
}
