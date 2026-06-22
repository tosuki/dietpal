package com.example.dietpal.data.repository

import android.content.Context
import com.example.dietpal.data.api.DietPalApiService
import com.mongodb.ConnectionString
import com.mongodb.client.MongoClients
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.bson.Document
import java.util.concurrent.TimeUnit

object DietPalRepositoryProvider {
    private var activeRepository: DietPalRepository? = null

    fun getRepository(context: Context): DietPalRepository {
        if (activeRepository == null) {
            initialize(context)
        }
        return activeRepository!!
    }

    fun initialize(context: Context) {
        val prefs = context.getSharedPreferences("dietpal_settings", Context.MODE_PRIVATE)
        val mode = prefs.getString("data_mode", "API") ?: "API"

        activeRepository = if (mode == "MONGO") {
            val mongoUri = prefs.getString("mongo_uri", "mongodb://10.0.2.2:27017") ?: "mongodb://10.0.2.2:27017"
            val mongoDb = prefs.getString("mongo_db", "diet_broker") ?: "diet_broker"
            MongoDietPalRepository(mongoUri, mongoDb)
        } else {
            val apiUrl = prefs.getString("api_url", "http://10.0.2.2:3001/api") ?: "http://10.0.2.2:3001/api"
            DietPalApiService.baseUrl = apiUrl
            ApiDietPalRepository()
        }
    }

    suspend fun testApiConnection(apiUrl: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val client = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(5, TimeUnit.SECONDS)
                .build()
            val request = Request.Builder()
                .url(if (apiUrl.endsWith("/")) "${apiUrl}foods" else "$apiUrl/foods")
                .build()
            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    Result.success(Unit)
                } else {
                    Result.failure(Exception("Erro HTTP: ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun testMongoConnection(mongoUri: String, dbName: String): Result<Unit> = withContext(Dispatchers.IO) {
        var client: com.mongodb.client.MongoClient? = null
        try {
            val connectionStringObj = ConnectionString(mongoUri)
            client = MongoClients.create(connectionStringObj)
            val database = client.getDatabase(dbName)
            database.runCommand(Document("ping", 1))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            try {
                client?.close()
            } catch (e: Exception) {
                // ignore
            }
        }
    }
}
