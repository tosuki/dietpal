package com.example.dietpal.data.repository

import com.example.dietpal.data.model.Diet
import com.example.dietpal.data.model.Food
import com.example.dietpal.data.model.Meal
import com.example.dietpal.data.model.MealFood
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Indexes
import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.Sorts
import com.mongodb.client.model.Updates
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.bson.Document
import java.util.Date
import java.util.UUID

class MongoDietPalRepository(
    private val connectionString: String,
    private val databaseName: String
) : DietPalRepository {

    // Lazy client initialization to avoid network overhead during service instantiation
    private val client: MongoClient by lazy {
        MongoClients.create(connectionString)
    }

    private val db: MongoDatabase
        get() = client.getDatabase(databaseName)

    private val foodsCollection: MongoCollection<Document>
        get() = db.getCollection("foods")

    private val dietsCollection: MongoCollection<Document>
        get() = db.getCollection("diets")

    init {
        // Criar índice único de nome de alimento de forma assíncrona
        Thread {
            try {
                foodsCollection.createIndex(Indexes.ascending("name"), IndexOptions().unique(true))
                dietsCollection.createIndex(Indexes.ascending("isActive"))
                dietsCollection.createIndex(Indexes.descending("updatedAt"))
            } catch (e: Exception) {
                // Silenciar erros de conexão durante build/iniciação inicial
            }
        }.start()
    }

    private fun documentToFood(doc: Document): Food {
        return Food(
            id = doc.getString("_id") ?: "",
            name = doc.getString("name") ?: "",
            calories = doc.getDouble("calories") ?: 0.0,
            protein = doc.getDouble("protein") ?: 0.0,
            carbs = doc.getDouble("carbs") ?: 0.0,
            fat = doc.getDouble("fat") ?: 0.0,
            isCustom = doc.getBoolean("isCustom") ?: false
        )
    }

    private fun documentToDiet(doc: Document): Diet {
        val mealsList = doc.get("meals") as? List<*> ?: emptyList<Any>()
        val meals = mealsList.mapNotNull { item ->
            val mealDoc = item as? Document ?: return@mapNotNull null
            val foodsList = mealDoc.get("foods") as? List<*> ?: emptyList<Any>()
            val foods = foodsList.mapNotNull { foodItem ->
                val fDoc = foodItem as? Document ?: return@mapNotNull null
                val amount = fDoc.getDouble("amount") ?: 100.0
                val calories = fDoc.getDouble("calories") ?: 0.0
                
                // Calcula macros base localmente se não salvos para recálculos
                val baseCal = fDoc.getDouble("baseCalories") ?: if (amount > 0) (calories / amount * 100.0) else calories
                val baseProt = fDoc.getDouble("baseProtein") ?: if (amount > 0) ((fDoc.getDouble("protein") ?: 0.0) / amount * 100.0) else (fDoc.getDouble("protein") ?: 0.0)
                val baseCarb = fDoc.getDouble("baseCarbs") ?: if (amount > 0) ((fDoc.getDouble("carbs") ?: 0.0) / amount * 100.0) else (fDoc.getDouble("carbs") ?: 0.0)
                val baseFat = fDoc.getDouble("baseFat") ?: if (amount > 0) ((fDoc.getDouble("fat") ?: 0.0) / amount * 100.0) else (fDoc.getDouble("fat") ?: 0.0)

                MealFood(
                    id = fDoc.getString("id"),
                    foodId = fDoc.getString("foodId"),
                    name = fDoc.getString("name") ?: "",
                    calories = calories,
                    protein = fDoc.getDouble("protein") ?: 0.0,
                    carbs = fDoc.getDouble("carbs") ?: 0.0,
                    fat = fDoc.getDouble("fat") ?: 0.0,
                    amount = amount,
                    baseCalories = baseCal,
                    baseProtein = baseProt,
                    baseCarbs = baseCarb,
                    baseFat = baseFat
                )
            }
            Meal(
                id = mealDoc.getString("id"),
                name = mealDoc.getString("name") ?: "",
                order = mealDoc.getInteger("order") ?: 0,
                foods = foods
            )
        }.sortedBy { it.order }

        return Diet(
            id = doc.getString("_id") ?: "",
            name = doc.getString("name") ?: "",
            description = doc.getString("description"),
            targetCalories = doc.getDouble("targetCalories") ?: 2000.0,
            targetProtein = doc.getDouble("targetProtein") ?: 150.0,
            targetCarbs = doc.getDouble("targetCarbs") ?: 200.0,
            targetFat = doc.getDouble("targetFat") ?: 70.0,
            isActive = doc.getBoolean("isActive") ?: false,
            meals = meals
        )
    }

    private fun dietToDocument(diet: Diet): Document {
        val now = Date()
        val mealsDocList = diet.meals.mapIndexed { idx, meal ->
            val foodsDocList = meal.foods.map { f ->
                Document().apply {
                    put("id", f.id ?: UUID.randomUUID().toString())
                    put("foodId", f.foodId)
                    put("name", f.name)
                    put("calories", f.calories)
                    put("protein", f.protein)
                    put("carbs", f.carbs)
                    put("fat", f.fat)
                    put("amount", f.amount)
                    put("baseCalories", f.finalBaseCalories)
                    put("baseProtein", f.finalBaseProtein)
                    put("baseCarbs", f.finalBaseCarbs)
                    put("baseFat", f.finalBaseFat)
                }
            }
            Document().apply {
                put("id", meal.id ?: UUID.randomUUID().toString())
                put("name", meal.name)
                put("order", idx)
                put("foods", foodsDocList)
            }
        }

        return Document().apply {
            put("_id", diet.id ?: UUID.randomUUID().toString())
            put("name", diet.name)
            put("description", diet.description)
            put("targetCalories", diet.targetCalories)
            put("targetProtein", diet.targetProtein)
            put("targetCarbs", diet.targetCarbs)
            put("targetFat", diet.targetFat)
            put("isActive", diet.isActive)
            put("updatedAt", now)
            // Se for novo, adiciona createdAt
            if (diet.id == null) {
                put("createdAt", now)
            }
            put("meals", mealsDocList)
        }
    }

    override suspend fun getFoods(query: String?): List<Food> = withContext(Dispatchers.IO) {
        val filter = if (query.isNullOrBlank()) {
            Document()
        } else {
            Filters.regex("name", query, "i")
        }
        foodsCollection.find(filter)
            .sort(Sorts.ascending("name"))
            .map { documentToFood(it) }
            .toList()
    }

    override suspend fun createCustomFood(
        name: String,
        calories: Double,
        protein: Double,
        carbs: Double,
        fat: Double
    ): Food = withContext(Dispatchers.IO) {
        val id = UUID.randomUUID().toString()
        val doc = Document().apply {
            put("_id", id)
            put("name", name)
            put("calories", calories)
            put("protein", protein)
            put("carbs", carbs)
            put("fat", fat)
            put("isCustom", true)
            put("createdAt", Date())
        }
        foodsCollection.insertOne(doc)
        documentToFood(doc)
    }

    override suspend fun deleteCustomFood(id: String): Boolean = withContext(Dispatchers.IO) {
        val result = foodsCollection.deleteOne(Filters.eq("_id", id))
        result.deletedCount > 0
    }

    override suspend fun getDiets(): List<Diet> = withContext(Dispatchers.IO) {
        dietsCollection.find()
            .sort(Sorts.descending("updatedAt"))
            .map { documentToDiet(it) }
            .toList()
    }

    override suspend fun getActiveDiet(): Diet? = withContext(Dispatchers.IO) {
        val doc = dietsCollection.find(Filters.eq("isActive", true)).first()
        doc?.let { documentToDiet(it) }
    }

    override suspend fun getDietDetails(id: String): Diet = withContext(Dispatchers.IO) {
        val doc = dietsCollection.find(Filters.eq("_id", id)).first()
            ?: throw NoSuchElementException("Dieta não encontrada")
        documentToDiet(doc)
    }

    override suspend fun createDiet(diet: Diet): Diet = withContext(Dispatchers.IO) {
        if (diet.isActive) {
            dietsCollection.updateMany(Filters.eq("isActive", true), Updates.set("isActive", false))
        }
        val doc = dietToDocument(diet)
        dietsCollection.insertOne(doc)
        documentToDiet(doc)
    }

    override suspend fun updateDiet(id: String, diet: Diet): Diet = withContext(Dispatchers.IO) {
        if (diet.isActive) {
            dietsCollection.updateMany(
                Filters.and(Filters.ne("_id", id), Filters.eq("isActive", true)),
                Updates.set("isActive", false)
            )
        }
        val doc = dietToDocument(diet.copy(id = id))
        val result = dietsCollection.replaceOne(Filters.eq("_id", id), doc)
        if (result.matchedCount == 0L) {
            throw NoSuchElementException("Dieta não encontrada para atualizar")
        }
        documentToDiet(doc)
    }

    override suspend fun activateDiet(id: String): Diet = withContext(Dispatchers.IO) {
        dietsCollection.updateMany(
            Filters.and(Filters.ne("_id", id), Filters.eq("isActive", true)),
            Updates.set("isActive", false)
        )
        val result = dietsCollection.updateOne(
            Filters.eq("_id", id),
            Updates.combine(Updates.set("isActive", true), Updates.set("updatedAt", Date()))
        )
        if (result.matchedCount == 0L) {
            throw NoSuchElementException("Dieta não encontrada para ativação")
        }
        getDietDetails(id)
    }

    override suspend fun deleteDiet(id: String): Boolean = withContext(Dispatchers.IO) {
        val result = dietsCollection.deleteOne(Filters.eq("_id", id))
        result.deletedCount > 0
    }
}
