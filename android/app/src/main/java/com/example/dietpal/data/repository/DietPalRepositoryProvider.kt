package com.example.dietpal.data.repository

import android.content.Context
import com.example.dietpal.data.api.DietPalApiService

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
}
