package com.example.dietpal.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.dietpal.data.api.DietPalApiService
import com.example.dietpal.data.model.Food
import com.example.dietpal.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddFoodDialog(
    onDismissRequest: () -> Unit,
    onAddFood: (Food, Double) -> Unit,
    showToastMessage: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    
    // Estados principais
    var searchQuery by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<Food>>(emptyList()) }
    var selectedFood by remember { mutableStateOf<Food?>(null) }
    var foodAmountText by remember { mutableStateOf("100") }
    var isCreatingCustom by remember { mutableStateOf(false) }

    // Estados do formulário de alimento customizado
    var customName by remember { mutableStateOf("") }
    var customCalories by remember { mutableStateOf("100") }
    var customProtein by remember { mutableStateOf("10") }
    var customCarbs by remember { mutableStateOf("10") }
    var customFat by remember { mutableStateOf("2") }

    // LaunchedEffect para debugar/buscar alimentos
    LaunchedEffect(searchQuery) {
        val trimmed = searchQuery.trim()
        if (trimmed.isNotEmpty() && selectedFood == null) {
            delay(300) // Debounce simples
            try {
                searchResults = DietPalApiService.getFoods(trimmed)
            } catch (e: Exception) {
                searchResults = emptyList()
            }
        } else {
            searchResults = emptyList()
        }
    }

    Dialog(onDismissRequest = onDismissRequest) {
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
                // Header
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Text(
                        text = if (isCreatingCustom) "Cadastrar Alimento Customizado" else "Adicionar Alimento",
                        color = TextMain,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                HorizontalDivider(color = CardBorder, thickness = 1.dp, modifier = Modifier.padding(bottom = 16.dp))

                if (!isCreatingCustom) {
                    // Campo de Busca
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = {
                            searchQuery = it
                            if (selectedFood != null && it != selectedFood?.name) {
                                selectedFood = null
                            }
                        },
                        label = { Text("Pesquisar Alimento (Padrão TACO + Custom)") },
                        placeholder = { Text("Ex: Arroz, Peito de Frango...") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = CardBorder,
                            focusedLabelColor = Primary
                        ),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                    )

                    // Resultados de Busca
                    if (searchResults.isNotEmpty() && selectedFood == null) {
                        Surface(
                            border = BorderStroke(1.dp, CardBorder),
                            shape = RoundedCornerShape(6.dp),
                            color = Color.White,
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 160.dp)
                                .padding(bottom = 16.dp)
                        ) {
                            LazyColumn {
                                items(searchResults) { food ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                selectedFood = food
                                                searchQuery = food.name
                                                searchResults = emptyList()
                                            }
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(food.name, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextMain)
                                            Text(
                                                text = "${Math.round(food.calories)}kcal | P: ${food.protein}g | C: ${food.carbs}g | G: ${food.fat}g (por 100g)",
                                                fontSize = 11.sp,
                                                color = TextMuted
                                            )
                                        }
                                        
                                        Surface(
                                            color = BgColor,
                                            border = BorderStroke(1.dp, CardBorder),
                                            shape = RoundedCornerShape(4.dp),
                                            modifier = Modifier.padding(start = 8.dp)
                                        ) {
                                            Text(
                                                text = if (food.isCustom) "Custom" else "TACO",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextMain,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Seletor de Porção
                    selectedFood?.let { food ->
                        val amount = foodAmountText.toDoubleOrNull() ?: 0.0
                        val factor = amount / 100.0
                        
                        Surface(
                            color = BgColor,
                            shape = RoundedCornerShape(6.dp),
                            border = BorderStroke(1.dp, CardBorder),
                            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Alimento Selecionado: ${food.name}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextMain)
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                OutlinedTextField(
                                    value = foodAmountText,
                                    onValueChange = { foodAmountText = it },
                                    label = { Text("Quantidade a adicionar (g)") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Primary,
                                        unfocusedBorderColor = CardBorder,
                                        focusedLabelColor = Primary
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                // Visualização dos macros calculados
                                Row(
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("${Math.round(food.calories * factor)} kcal", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextMain)
                                    Text("${String.format("%.1f", food.protein * factor)}g P", fontSize = 12.sp, color = TextMuted)
                                    Text("${String.format("%.1f", food.carbs * factor)}g C", fontSize = 12.sp, color = TextMuted)
                                    Text("${String.format("%.1f", food.fat * factor)}g G", fontSize = 12.sp, color = TextMuted)
                                }
                            }
                        }
                    }

                    // Link para criar alimento customizado
                    Text(
                        text = "Não encontrou? Cadastrar alimento customizado",
                        color = Primary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        textDecoration = TextDecoration.Underline,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isCreatingCustom = true }
                            .padding(vertical = 12.dp)
                    )

                    // Footer
                    Row(
                        horizontalArrangement = Arrangement.End,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TextButton(
                            onClick = onDismissRequest,
                            colors = ButtonDefaults.textButtonColors(contentColor = TextMain),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text("Cancelar", fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = {
                                selectedFood?.let { food ->
                                    val amount = foodAmountText.toDoubleOrNull() ?: 100.0
                                    onAddFood(food, amount)
                                }
                            },
                            enabled = selectedFood != null,
                            colors = ButtonDefaults.buttonColors(containerColor = Primary),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Adicionar à Refeição", fontWeight = FontWeight.SemiBold)
                        }
                    }
                } else {
                    // Formulário de Cadastro de Alimento Customizado Permanente
                    OutlinedTextField(
                        value = customName,
                        onValueChange = { customName = it },
                        label = { Text("Nome do Alimento") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = customCalories,
                        onValueChange = { customCalories = it },
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
                            value = customProtein,
                            onValueChange = { customProtein = it },
                            label = { Text("Prot (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = customCarbs,
                            onValueChange = { customCarbs = it },
                            label = { Text("Carb (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = customFat,
                            onValueChange = { customFat = it },
                            label = { Text("Gord (g)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Botões Customizados
                    Row(
                        horizontalArrangement = Arrangement.End,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TextButton(
                            onClick = { isCreatingCustom = false },
                            colors = ButtonDefaults.textButtonColors(contentColor = TextMain),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text("Voltar", fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = {
                                if (customName.trim().isEmpty()) {
                                    showToastMessage("Nome do alimento é obrigatório")
                                    return@Button
                                }
                                coroutineScope.launch {
                                    try {
                                        val food = DietPalApiService.createCustomFood(
                                            name = customName,
                                            calories = customCalories.toDoubleOrNull() ?: 0.0,
                                            protein = customProtein.toDoubleOrNull() ?: 0.0,
                                            carbs = customCarbs.toDoubleOrNull() ?: 0.0,
                                            fat = customFat.toDoubleOrNull() ?: 0.0
                                        )
                                        // Auto-selecionar alimento recém-criado
                                        selectedFood = food
                                        searchQuery = food.name
                                        isCreatingCustom = false
                                        showToastMessage("Alimento cadastrado com sucesso!")
                                    } catch (e: Exception) {
                                        showToastMessage(e.message ?: "Erro ao salvar alimento")
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Primary),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Salvar no Catálogo", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}
