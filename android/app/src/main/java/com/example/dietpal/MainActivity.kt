package com.example.dietpal

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewScreenSizes
import androidx.compose.ui.unit.dp
import com.example.dietpal.data.repository.DietPalRepositoryProvider
import com.example.dietpal.ui.components.SettingsDialog
import com.example.dietpal.ui.screens.CatalogScreen
import com.example.dietpal.ui.screens.CustomFoodsScreen
import com.example.dietpal.ui.screens.DashboardScreen
import com.example.dietpal.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inicializa o repositório ativo com base nas configurações
        DietPalRepositoryProvider.initialize(this)
        
        enableEdgeToEdge()
        setContent {
            DietPalTheme {
                DietPalApp()
            }
        }
    }
}

@PreviewScreenSizes
@Composable
fun DietPalApp() {
    val context = LocalContext.current
    var currentDestination by rememberSaveable { mutableStateOf(AppDestinations.DASHBOARD) }
    
    // Trigger para atualizar as telas ao salvar novas configurações de banco/API
    var globalRefreshTrigger by remember { mutableStateOf(0) }
    var isSettingsOpen by remember { mutableStateOf(false) }

    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BgColor,
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 24.dp, vertical = 12.dp)
            ) {
                NavigationBar(
                    containerColor = Color.White,
                    tonalElevation = 0.dp,
                    windowInsets = WindowInsets(0, 0, 0, 0),
                    modifier = Modifier
                        .height(64.dp)
                        .graphicsLayer {
                            shape = RoundedCornerShape(32.dp)
                            clip = true
                        }
                        .border(1.dp, CardBorder, RoundedCornerShape(32.dp))
                ) {
                    AppDestinations.entries.forEach { destination ->
                        NavigationBarItem(
                            selected = destination == currentDestination,
                            onClick = { currentDestination = destination },
                            icon = {
                                Icon(
                                    painterResource(destination.icon),
                                    contentDescription = destination.label
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TextMain,
                                unselectedIconColor = TextMuted,
                                indicatorColor = PrimaryGlow
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize()) {
            // Conteúdo principal baseado na aba ativa
            Box(modifier = Modifier.padding(innerPadding)) {
                key(globalRefreshTrigger) {
                    when (currentDestination) {
                        AppDestinations.DASHBOARD -> {
                            DashboardScreen(
                                showToastMessage = { showToast(it) }
                            )
                        }
                        AppDestinations.CATALOG -> {
                            CatalogScreen(
                                showToastMessage = { showToast(it) },
                                onDietActivated = {
                                    globalRefreshTrigger++
                                }
                            )
                        }
                        AppDestinations.FOODS -> {
                            CustomFoodsScreen(
                                showToastMessage = { showToast(it) }
                            )
                        }
                    }
                }
            }
            
            // Botão de Engrenagem (Ajustes de Conexão) no topo direito
            IconButton(
                onClick = { isSettingsOpen = true },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .statusBarsPadding()
                    .padding(top = 16.dp, end = 16.dp)
            ) {
                Icon(
                    Icons.Default.Settings,
                    contentDescription = "Ajustes",
                    tint = TextMain
                )
            }
        }
    }

    // Modal de Configurações
    if (isSettingsOpen) {
        SettingsDialog(
            onDismissRequest = { isSettingsOpen = false },
            onSettingsSaved = {
                globalRefreshTrigger++
                showToast("Configurações atualizadas com sucesso!")
            }
        )
    }
}

enum class AppDestinations(
    val label: String,
    val icon: Int,
) {
    DASHBOARD("Dieta Atual", R.drawable.ic_home),
    CATALOG("Catálogo", R.drawable.ic_favorite),
    FOODS("Alimentos", R.drawable.ic_account_box),
}