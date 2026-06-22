package com.example.dietpal.data.api

import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Food
import com.example.dietpal.data.model.Meal
import com.example.dietpal.data.model.MealFood
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

object DietPalApiService {
    // Configura o endpoint padrão para o emulador do Android acessar a máquina local
    var baseUrl = "http://10.0.2.2:3001/api"
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private inline fun <reified T> Gson.fromJson(json: String) = 
        fromJson<T>(json, object : TypeToken<T>() {}.type)

    // Helper genérico para requisições GET
    private suspend inline fun <reified T> getRequest(path: String): T = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl$path")
            .get()
            .build()
            
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                if (response.code == 404 && T::class == Diet::class) {
                    // Retorna null ou lança específico
                    throw NoSuchElementException("Recurso não encontrado")
                }
                val body = response.body?.string() ?: ""
                val errorMsg = try {
                    gson.fromJson<Map<String, String>>(body)["error"] ?: "Erro na requisição: ${response.code}"
                } catch (e: Exception) {
                    "Erro na requisição: ${response.code}"
                }
                throw IOException(errorMsg)
            }
            val bodyString = response.body?.string() ?: throw IOException("Corpo da resposta vazio")
            gson.fromJson<T>(bodyString)
        }
    }

    // Helper genérico para requisições POST/PUT
    private suspend inline fun <reified T> postOrPutRequest(path: String, bodyData: Any, isPut: Boolean = false): T = withContext(Dispatchers.IO) {
        val json = gson.toJson(bodyData)
        val requestBody = json.toRequestBody(jsonMediaType)
        
        val requestBuilder = Request.Builder()
            .url("$baseUrl$path")
        
        if (isPut) {
            requestBuilder.put(requestBody)
        } else {
            requestBuilder.post(requestBody)
        }
        
        val request = requestBuilder.build()
        
        client.newCall(request).execute().use { response ->
            val bodyString = response.body?.string() ?: ""
            if (!response.isSuccessful) {
                val errorMsg = try {
                    gson.fromJson<Map<String, String>>(bodyString)["error"] ?: "Erro no envio: ${response.code}"
                } catch (e: Exception) {
                    "Erro no envio: ${response.code}"
                }
                throw IOException(errorMsg)
            }
            if (bodyString.isEmpty() && T::class == Unit::class) {
                return@withContext Unit as T
            }
            gson.fromJson<T>(bodyString)
        }
    }

    // Helper genérico para requisições DELETE
    private suspend fun deleteRequest(path: String): Boolean = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$baseUrl$path")
            .delete()
            .build()
            
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val body = response.body?.string() ?: ""
                val errorMsg = try {
                    gson.fromJson<Map<String, String>>(body)["error"] ?: "Erro na exclusão"
                } catch (e: Exception) {
                    "Erro na exclusão"
                }
                throw IOException(errorMsg)
            }
            true
        }
    }

    // 1. Buscar catálogo de alimentos
    suspend fun getFoods(query: String? = null): List<Food> {
        val path = if (query.isNullOrBlank()) "/foods" else "/foods?q=${UriEncoder.encode(query)}"
        return getRequest(path)
    }

    // 2. Criar alimento customizado no catálogo
    suspend fun createCustomFood(name: String, calories: Double, protein: Double, carbs: Double, fat: Double): Food {
        val data = mapOf(
            "name" to name,
            "calories" to calories,
            "protein" to protein,
            "carbs" to carbs,
            "fat" to fat
        )
        return postOrPutRequest("/foods/custom", data)
    }

    // 3. Deletar alimento customizado
    suspend fun deleteCustomFood(id: String): Boolean {
        return deleteRequest("/foods/custom/$id")
    }

    // 4. Listar todas as dietas
    suspend fun getDiets(): List<Diet> {
        return getRequest("/diets")
    }

    // 5. Obter dieta ativa atual
    suspend fun getActiveDiet(): Diet? = withContext(Dispatchers.IO) {
        try {
            getRequest<Diet>("/diets/active")
        } catch (e: NoSuchElementException) {
            null
        } catch (e: IOException) {
            if (e.message?.contains("404") == true) {
                null
            } else {
                throw e
            }
        }
    }

    // 6. Obter detalhes de dieta específica
    suspend fun getDietDetails(id: String): Diet {
        return getRequest("/diets/$id")
    }

    // 7. Criar nova dieta
    suspend fun createDiet(diet: Diet): Diet {
        // Mapeia para corresponder ao payload aceito no backend
        val payload = mapOf(
            "name" to diet.name,
            "description" to diet.description,
            "targetCalories" to diet.targetCalories,
            "targetProtein" to diet.targetProtein,
            "targetCarbs" to diet.targetCarbs,
            "targetFat" to diet.targetFat,
            "isActive" to diet.isActive,
            "meals" to diet.meals.map { meal ->
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
        )
        return postOrPutRequest("/diets", payload)
    }

    // 8. Atualizar dieta (Salvar alterações / Autosave)
    suspend fun updateDiet(id: String, diet: Diet): Diet {
        val payload = mapOf(
            "name" to diet.name,
            "description" to diet.description,
            "targetCalories" to diet.targetCalories,
            "targetProtein" to diet.targetProtein,
            "targetCarbs" to diet.targetCarbs,
            "targetFat" to diet.targetFat,
            "isActive" to diet.isActive,
            "meals" to diet.meals.mapIndexed { idx, meal ->
                mapOf(
                    "name" to meal.name,
                    "order" to idx,
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
        )
        return postOrPutRequest("/diets/$id", payload, isPut = true)
    }

    // 9. Ativar dieta
    suspend fun activateDiet(id: String): Diet {
        return postOrPutRequest("/diets/$id/activate", emptyMap<String, String>())
    }

    // 10. Deletar dieta
    suspend fun deleteDiet(id: String): Boolean {
        return deleteRequest("/diets/$id")
    }
}

// Utilitário simples para encodificar strings para URL no Kotlin nativo
object UriEncoder {
    fun encode(s: String): String {
        return java.net.URLEncoder.encode(s, "UTF-8")
    }
}
