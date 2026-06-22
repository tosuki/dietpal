package com.example.dietpal

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewScreenSizes
import com.example.dietpal.ui.screens.CatalogScreen
import com.example.dietpal.ui.screens.CustomFoodsScreen
import com.example.dietpal.ui.screens.DashboardScreen
import com.example.dietpal.ui.theme.DietPalTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
    
    // Trigger para atualizar o Dashboard ao alterar a dieta ativa
    var dashboardRefreshTrigger by remember { mutableStateOf(0) }

    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    NavigationSuiteScaffold(
        navigationSuiteItems = {
            AppDestinations.entries.forEach {
                item(
                    icon = {
                        Icon(
                            painterResource(it.icon),
                            contentDescription = it.label
                        )
                    },
                    label = { Text(it.label) },
                    selected = it == currentDestination,
                    onClick = { currentDestination = it }
                )
            }
        }
    ) {
        Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                when (currentDestination) {
                    AppDestinations.DASHBOARD -> {
                        key(dashboardRefreshTrigger) {
                            DashboardScreen(
                                showToastMessage = { showToast(it) }
                            )
                        }
                    }
                    AppDestinations.CATALOG -> {
                        CatalogScreen(
                            showToastMessage = { showToast(it) },
                            onDietActivated = {
                                dashboardRefreshTrigger++
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