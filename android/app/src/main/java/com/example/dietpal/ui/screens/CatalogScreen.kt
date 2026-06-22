package com.example.dietpal.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.dietpal.data.api.DietPalApiService
import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Meal
import com.example.dietpal.data.model.MealFood
import com.example.dietpal.ui.components.CreateDietDialog
import com.example.dietpal.ui.components.CustomDialog
import com.example.dietpal.ui.theme.*
import com.google.gson.Gson
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(
    showToastMessage: (String) -> Unit,
    onDietActivated: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val gson = Gson()

    // Estados
    var diets by remember { mutableStateOf<List<Diet>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isError by remember { mutableStateOf(false) }

    var isCreateDialogOpen by remember { mutableStateOf(false) }
    var dietToDelete by remember { mutableStateOf<Diet?>(null) }

    fun loadDiets() {
        coroutineScope.launch {
            isLoading = true
            isError = false
            try {
                diets = DietPalApiService.getDiets()
            } catch (e: Exception) {
                isError = true
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadDiets()
    }

    // Launcher para selecionar arquivo JSON na importação
    val importLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        
        coroutineScope.launch {
            try {
                context.contentResolver.openInputStream(uri)?.use { inputStream ->
                    BufferedReader(InputStreamReader(inputStream)).use { reader ->
                        val jsonString = reader.readText()
                        
                        // Parse JSON
                        val imported = gson.fromJson(jsonString, Diet::class.java)
                        if (imported.name.isNullOrBlank()) {
                            throw Exception("JSON inválido: Nome da dieta é obrigatório.")
                        }

                        // Criar no servidor com identificação
                        val cleanMeals = imported.meals.mapIndexed { idx, meal ->
                            Meal(
                                name = meal.name.ifBlank { "Refeição ${idx + 1}" },
                                order = meal.order,
                                foods = meal.foods.map { f ->
                                    MealFood(
                                        foodId = f.foodId,
                                        name = f.name,
                                        amount = f.amount,
                                        calories = f.calories,
                                        protein = f.protein,
                                        carbs = f.carbs,
                                        fat = f.fat
                                    )
                                }
                            )
                        }

                        val toCreate = imported.copy(
                            id = null,
                            name = "${imported.name} (Importada)",
                            description = imported.description ?: "Importada de arquivo JSON",
                            isActive = true,
                            meals = cleanMeals
                        )

                        DietPalApiService.createDiet(toCreate)
                        showToastMessage("Dieta importada com sucesso!")
                        loadDiets()
                        onDietActivated() // Atualiza dashboard
                    }
                }
            } catch (e: Exception) {
                showToastMessage("Falha ao importar: ${e.message}")
            }
        }
    }

    // Função de exportação / compartilhamento
    fun handleExportDiet(diet: Diet) {
        coroutineScope.launch {
            try {
                // Obter detalhes completos da dieta com refeições e alimentos inclusos
                val detail = DietPalApiService.getDietDetails(diet.id!!)
                
                // Limpar campos de sistema para o arquivo de exportação
                val cleanedMeals = detail.meals.map { meal ->
                    mapOf(
                        "name" to meal.name,
                        "order" to meal.order,
                        "foods" to meal.foods.map { f ->
                            mapOf(
                                "foodId" to f.foodId,
                                "name" to f.name,
                                "calories" to f.calories,
                                "protein" to f.protein,
                                "carbs" to f.carbs,
                                "fat" to f.fat,
                                "amount" to f.amount
                            )
                        }
                    )
                }

                val exportData = mapOf(
                    "name" to detail.name,
                    "description" to detail.description,
                    "targetCalories" to detail.targetCalories,
                    "targetProtein" to detail.targetProtein,
                    "targetCarbs" to detail.targetCarbs,
                    "targetFat" to detail.targetFat,
                    "isActive" to false, // Padrão falso na exportação
                    "meals" to cleanedMeals
                )

                val jsonString = gson.toJson(exportData)

                // Lançar Share Intent no Android
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/json"
                    putExtra(Intent.EXTRA_SUBJECT, "DietaPal - ${detail.name}")
                    putExtra(Intent.EXTRA_TEXT, jsonString)
                }
                
                context.startActivity(Intent.createChooser(shareIntent, "Exportar Dieta"))
            } catch (e: Exception) {
                showToastMessage("Erro ao exportar dieta: ${e.message}")
            }
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
                Text("Erro de Conexão", color = RedAccent, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Não foi possível carregar o catálogo de dietas.", color = TextMuted, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = { loadDiets() }, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
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
                    text = "Catálogo de Dietas",
                    color = TextMain,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Crie, ative, e compartilhe suas estruturas de dieta.",
                    color = TextMuted,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Button(
                        onClick = { isCreateDialogOpen = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Criar Dieta", fontWeight = FontWeight.SemiBold)
                    }

                    Button(
                        onClick = { importLauncher.launch("application/json") },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = TextMain),
                        border = BorderStroke(1.dp, CardBorder),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Importar JSON", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        // Listagem de dietas
        if (diets.isEmpty()) {
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
                        text = "Nenhuma dieta cadastrada. Crie uma nova para começar!",
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
            items(diets) { diet ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White,
                    border = BorderStroke(1.dp, CardBorder),
                    shadowElevation = 1.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = diet.name,
                                color = TextMain,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.weight(1f)
                            )

                            if (diet.isActive) {
                                Surface(
                                    color = GreenGlow,
                                    border = BorderStroke(1.dp, GreenBorder),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "ATIVA",
                                        color = GreenAccent,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }

                        diet.description?.let {
                            Text(
                                text = it,
                                color = TextMuted,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                            )
                        }

                        // Resumo das metas de macros
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(BgColor, RoundedCornerShape(6.dp))
                                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("CALORIAS", fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Text("${Math.round(diet.targetCalories)} kcal", fontSize = 12.sp, color = TextMain, fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text("PROT", fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Text("${Math.round(diet.targetProtein)}g", fontSize = 12.sp, color = TextMain, fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text("CARB", fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Text("${Math.round(diet.targetCarbs)}g", fontSize = 12.sp, color = TextMain, fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text("GORD", fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Text("${Math.round(diet.targetFat)}g", fontSize = 12.sp, color = TextMain, fontWeight = FontWeight.Bold)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Ações do Card
                        Row(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (!diet.isActive) {
                                Button(
                                    onClick = {
                                        coroutineScope.launch {
                                            try {
                                                DietPalApiService.activateDiet(diet.id!!)
                                                showToastMessage("Dieta \"${diet.name}\" ativada!")
                                                loadDiets()
                                                onDietActivated() // Atualiza dashboard
                                            } catch (e: Exception) {
                                                showToastMessage("Erro ao ativar dieta.")
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                    modifier = Modifier.padding(end = 8.dp)
                                ) {
                                    Text("Ativar", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }

                            Button(
                                onClick = { handleExportDiet(diet) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = TextMain),
                                border = BorderStroke(1.dp, CardBorder),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier.padding(end = 8.dp)
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Exportar", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }

                            Spacer(modifier = Modifier.weight(1f))

                            IconButton(
                                onClick = { dietToDelete = diet },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    Icons.Default.Delete,
                                    contentDescription = "Excluir Dieta",
                                    tint = RedAccent,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal de Criação de Dieta
    if (isCreateDialogOpen) {
        CreateDietDialog(
            onDismissRequest = { isCreateDialogOpen = false },
            onCreateDiet = { newDiet ->
                coroutineScope.launch {
                    try {
                        DietPalApiService.createDiet(newDiet)
                        showToastMessage("Dieta criada com sucesso!")
                        isCreateDialogOpen = false
                        loadDiets()
                        if (newDiet.isActive) {
                            onDietActivated()
                        }
                    } catch (e: Exception) {
                        showToastMessage(e.message ?: "Erro ao criar dieta.")
                    }
                }
            },
            showToastMessage = showToastMessage
        )
    }

    // Modal de Confirmação de Exclusão
    dietToDelete?.let { diet ->
        CustomDialog(
            title = "Excluir Dieta",
            message = "Deseja realmente excluir a dieta \"${diet.name}\" permanentemente do catálogo?",
            confirmText = "Confirmar",
            cancelText = "Cancelar",
            onConfirm = {
                coroutineScope.launch {
                    try {
                        DietPalApiService.deleteDiet(diet.id!!)
                        showToastMessage("Dieta excluída com sucesso.")
                        loadDiets()
                        if (diet.isActive) {
                            onDietActivated() // Atualiza dashboard
                        }
                    } catch (e: Exception) {
                        showToastMessage("Erro ao excluir a dieta.")
                    } finally {
                        dietToDelete = null
                    }
                }
            },
            onCancel = {
                dietToDelete = null
            }
        )
    }
}
