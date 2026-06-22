package com.example.dietpal.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Meal
import com.example.dietpal.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateDietDialog(
    onDismissRequest: () -> Unit,
    onCreateDiet: (Diet) -> Unit,
    showToastMessage: (String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var targetCalories by remember { mutableStateOf("2000") }
    var targetProtein by remember { mutableStateOf("150") }
    var targetCarbs by remember { mutableStateOf("200") }
    var targetFat by remember { mutableStateOf("70") }
    var isActive by remember { mutableStateOf(true) }

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
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Criar Nova Dieta",
                    color = TextMain,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                HorizontalDivider(color = CardBorder, thickness = 1.dp, modifier = Modifier.padding(bottom = 16.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nome da Dieta") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Descrição") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                )

                OutlinedTextField(
                    value = targetCalories,
                    onValueChange = { targetCalories = it },
                    label = { Text("Meta de Calorias (kcal)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    OutlinedTextField(
                        value = targetProtein,
                        onValueChange = { targetProtein = it },
                        label = { Text("Prot (g)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = targetCarbs,
                        onValueChange = { targetCarbs = it },
                        label = { Text("Carb (g)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = targetFat,
                        onValueChange = { targetFat = it },
                        label = { Text("Gord (g)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = CardBorder, focusedLabelColor = Primary),
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
                ) {
                    Checkbox(
                        checked = isActive,
                        onCheckedChange = { isActive = it },
                        colors = CheckboxDefaults.colors(checkedColor = Primary)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Definir como Dieta Ativa imediatamente", color = TextMain, fontSize = 14.sp)
                }

                // Footer
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(
                        onClick = onDismissRequest,
                        colors = ButtonDefaults.textButtonColors(contentColor = TextMain),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text("Cancelar", fontWeight = FontWeight.SemiBold)
                    }

                    Button(
                        onClick = {
                            if (name.trim().isEmpty()) {
                                showToastMessage("Nome da dieta é obrigatório")
                                return@Button
                            }
                            
                            val initialMeals = listOf(
                                Meal(name = "Café da Manhã", order = 0),
                                Meal(name = "Almoço", order = 1),
                                Meal(name = "Café da Tarde", order = 2),
                                Meal(name = "Jantar", order = 3)
                            )
                            
                            val diet = Diet(
                                name = name,
                                description = description.ifEmpty { null },
                                targetCalories = targetCalories.toDoubleOrNull() ?: 2000.0,
                                targetProtein = targetProtein.toDoubleOrNull() ?: 150.0,
                                targetCarbs = targetCarbs.toDoubleOrNull() ?: 200.0,
                                targetFat = targetFat.toDoubleOrNull() ?: 70.0,
                                isActive = isActive,
                                meals = initialMeals
                            )
                            
                            onCreateDiet(diet)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("Criar Dieta", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
