package com.example.dietpal.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.dietpal.ui.theme.*

@Composable
fun MacroCard(
    title: String,
    current: Double,
    target: Double,
    unit: String,
    modifier: Modifier = Modifier
) {
    val currentInt = if (unit == "kcal") Math.round(current).toInt() else current
    val targetInt = if (unit == "kcal") Math.round(target).toInt() else target
    val pct = if (target > 0) Math.min(100, Math.round((current / target) * 100.0).toInt()) else 0

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = Color.White,
        border = BorderStroke(1.dp, CardBorder),
        shadowElevation = 1.dp,
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title.uppercase(),
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Text(
                    text = if (unit == "kcal") "$currentInt" else "${String.format("%.1f", current)}g",
                    color = TextMain,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (unit == "kcal") "/ $targetInt $unit" else "/ ${targetInt}g",
                    color = TextMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }

            LinearProgressIndicator(
                progress = { (pct / 100.0).toFloat() },
                color = Primary,
                trackColor = PrimaryGlow,
                strokeCap = StrokeCap.Round,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .padding(bottom = 4.dp)
            )
            
            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "$pct% consumido",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.End)
            )
        }
    }
}
