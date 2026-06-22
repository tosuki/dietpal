package com.example.dietpal.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MonochromaticColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = Color.White,
    primaryContainer = PrimaryGlow,
    onPrimaryContainer = TextMain,
    secondary = TextMuted,
    onSecondary = Color.White,
    secondaryContainer = PrimaryGlow,
    onSecondaryContainer = TextMain,
    background = BgColor,
    onBackground = TextMain,
    surface = CardBg,
    onSurface = TextMain,
    surfaceVariant = CardBg,
    onSurfaceVariant = TextMuted,
    surfaceContainer = Color.White,
    outline = CardBorder
)

@Composable
fun DietPalTheme(
    darkTheme: Boolean = false, // Mantém tema Light Monocromático conforme versão web
    dynamicColor: Boolean = false, // Mantém a paleta de cores monocromática idêntica
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = MonochromaticColorScheme,
        typography = Typography,
        content = content
    )
}