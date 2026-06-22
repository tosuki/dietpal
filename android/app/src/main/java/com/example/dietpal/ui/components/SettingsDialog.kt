package com.example.dietpal.ui.components

import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.dietpal.data.repository.DietPalRepositoryProvider
import com.example.dietpal.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsDialog(
    onDismissRequest: () -> Unit,
    onSettingsSaved: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("dietpal_settings", Context.MODE_PRIVATE) }

    // Carregar configurações salvas
    var dataMode by remember { mutableStateOf(prefs.getString("data_mode", "API") ?: "API") }
    var apiUrl by remember { mutableStateOf(prefs.getString("api_url", "http://10.0.2.2:3001/api") ?: "http://10.0.2.2:3001/api") }
    var mongoUri by remember { mutableStateOf(prefs.getString("mongo_uri", "mongodb://10.0.2.2:27017") ?: "mongodb://10.0.2.2:27017") }
    var mongoDb by remember { mutableStateOf(prefs.getString("mongo_db", "diet_broker") ?: "diet_broker") }

    // Estados de teste de conexão
    var isTestingConnection by remember { mutableStateOf(false) }
    var connectionTestResult by remember { mutableStateOf<Result<Unit>?>(null) }

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
                    text = "Ajustes de Conexão",
                    color = TextMain,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                HorizontalDivider(color = CardBorder, thickness = 1.dp, modifier = Modifier.padding(bottom = 16.dp))

                // Seletor de Modo de Dados
                Text(
                    text = "Fonte de Dados Principal",
                    color = TextMain,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                ) {
                    RadioButton(
                        selected = dataMode == "API",
                        onClick = { dataMode = "API" },
                        colors = RadioButtonDefaults.colors(selectedColor = Primary)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("API REST (Servidor Backend)", color = TextMain, fontSize = 14.sp)
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp)
                ) {
                    RadioButton(
                        selected = dataMode == "MONGO",
                        onClick = { dataMode = "MONGO" },
                        colors = RadioButtonDefaults.colors(selectedColor = Primary)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Direct MongoDB (Conexão Direta)", color = TextMain, fontSize = 14.sp)
                }

                // Inputs de Configuração baseados no Modo
                if (dataMode == "API") {
                    OutlinedTextField(
                        value = apiUrl,
                        onValueChange = { apiUrl = it },
                        label = { Text("URL da API REST") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = CardBorder,
                            focusedLabelColor = Primary
                        ),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                    )
                } else {
                    OutlinedTextField(
                        value = mongoUri,
                        onValueChange = { mongoUri = it },
                        label = { Text("String de Conexão MongoDB") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = CardBorder,
                            focusedLabelColor = Primary
                        ),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = mongoDb,
                        onValueChange = { mongoDb = it },
                        label = { Text("Nome do Banco de Dados") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = CardBorder,
                            focusedLabelColor = Primary
                        ),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                    )
                }

                // Botão de testar conexão e feedback
                Column(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isTestingConnection = true
                                connectionTestResult = null
                                val result = if (dataMode == "API") {
                                    DietPalRepositoryProvider.testApiConnection(apiUrl)
                                } else {
                                    DietPalRepositoryProvider.testMongoConnection(mongoUri, mongoDb)
                                }
                                connectionTestResult = result
                                isTestingConnection = false
                            }
                        },
                        enabled = !isTestingConnection,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.White,
                            contentColor = TextMain
                        ),
                        border = BorderStroke(1.dp, CardBorder),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (isTestingConnection) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = TextMain,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Testando...", fontSize = 14.sp)
                        } else {
                            Text("Testar Conexão", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    connectionTestResult?.let { result ->
                        Spacer(modifier = Modifier.height(8.dp))
                        if (result.isSuccess) {
                            Text(
                                text = "Conexão estabelecida com sucesso!",
                                color = GreenAccent,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        } else {
                            val errorMsg = result.exceptionOrNull()?.message ?: "Erro desconhecido"
                            Text(
                                text = "Falha na conexão: $errorMsg",
                                color = RedAccent,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

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
                            // Salva no SharedPreferences
                            prefs.edit().apply {
                                putString("data_mode", dataMode)
                                putString("api_url", apiUrl)
                                putString("mongo_uri", mongoUri)
                                putString("mongo_db", mongoDb)
                                apply()
                            }
                            
                            // Re-inicializa o repository provider
                            DietPalRepositoryProvider.initialize(context)
                            
                            // Callback para notificar a tela principal a atualizar os dados
                            onSettingsSaved()
                            onDismissRequest()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("Salvar Ajustes", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
