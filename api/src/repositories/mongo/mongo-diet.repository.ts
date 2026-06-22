import { Collection } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { IDietRepository } from "../diet.repository.interface"
import { Diet, CreateDietInput } from "../types";
import { MongoRepository } from "./mongo.repository";

interface DietDocument {
    _id: string;
    name: string;
    description: string | null;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    meals: {
        id: string;
        name: string;
        order: number;
        foods: {
            id: string;
            foodId: string | null;
            name: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            amount: number;
        }[];
    }[];
}

export class MongoDBDietRepository extends MongoRepository implements IDietRepository {
    private get collection(): Collection<DietDocument> {
        return this.db.collection<DietDocument>("diets");
    }

    async init() {
        try {
            await this.collection.createIndex({ isActive: 1 });
            await this.collection.createIndex({ updatedAt: -1 });
        } catch (error) {
            console.error("Erro ao criar índices em diets:", error);
        }
    }

    private mapDietDocument(doc: any): Diet {
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description ?? null,
            targetCalories: doc.targetCalories,
            targetProtein: doc.targetProtein,
            targetCarbs: doc.targetCarbs,
            targetFat: doc.targetFat,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            meals: (doc.meals || []).map((meal: any) => ({
                id: meal.id,
                name: meal.name,
                order: meal.order,
                foods: (meal.foods || []).map((food: any) => ({
                    id: food.id,
                    foodId: food.foodId ?? null,
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    amount: food.amount,
                })),
            })),
        };
    }

    async listAll(): Promise<Omit<Diet, "meals">[]> {
        const docs = await this.collection
            .find({}, { projection: { meals: 0 } })
            .sort({ updatedAt: -1 })
            .toArray();

        return docs.map(doc => ({
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description ?? null,
            targetCalories: doc.targetCalories,
            targetProtein: doc.targetProtein,
            targetCarbs: doc.targetCarbs,
            targetFat: doc.targetFat,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));
    }

    async findActive(): Promise<Diet | null> {
        const doc = await this.collection.findOne({ isActive: true });
        if (!doc) return null;
        return this.mapDietDocument(doc);
    }

    async findById(id: string): Promise<Diet | null> {
        const doc = await this.collection.findOne({ _id: id });
        if (!doc) return null;
        return this.mapDietDocument(doc);
    }

    async create(data: CreateDietInput): Promise<Diet> {
        if (data.isActive) {
            await this.collection.updateMany(
                { isActive: true },
                { $set: { isActive: false } }
            );
        }

        const dietId = uuidv4();
        const now = new Date();

        const meals = (data.meals || []).map(meal => ({
            id: uuidv4(),
            name: meal.name,
            order: meal.order,
            foods: (meal.foods || []).map(food => ({
                id: uuidv4(),
                foodId: food.foodId ?? null,
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                amount: food.amount,
            })),
        }));

        const doc = {
            _id: dietId,
            name: data.name,
            description: data.description ?? null,
            targetCalories: data.targetCalories ?? 2000,
            targetProtein: data.targetProtein ?? 150,
            targetCarbs: data.targetCarbs ?? 200,
            targetFat: data.targetFat ?? 70,
            isActive: !!data.isActive,
            createdAt: now,
            updatedAt: now,
            meals,
        };

        await this.collection.insertOne(doc);

        return this.mapDietDocument(doc);
    }

    async update(id: string, data: CreateDietInput): Promise<Diet> {
        if (data.isActive) {
            await this.collection.updateMany(
                { _id: { $ne: id }, isActive: true },
                { $set: { isActive: false } }
            );
        }

        const meals = (data.meals || []).map(meal => ({
            id: uuidv4(),
            name: meal.name,
            order: meal.order,
            foods: (meal.foods || []).map(food => ({
                id: uuidv4(),
                foodId: food.foodId ?? null,
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                amount: food.amount,
            })),
        }));

        const updateDoc = {
            $set: {
                name: data.name,
                description: data.description ?? null,
                targetCalories: data.targetCalories ?? 2000,
                targetProtein: data.targetProtein ?? 150,
                targetCarbs: data.targetCarbs ?? 200,
                targetFat: data.targetFat ?? 70,
                isActive: !!data.isActive,
                updatedAt: new Date(),
                meals,
            }
        };

        const updateResult = await this.collection.updateOne(
            { _id: id },
            updateDoc
        );

        if (updateResult.matchedCount === 0) {
            throw new Error("Diet not found");
        }

        const updatedDoc = await this.collection.findOne({ _id: id });
        if (!updatedDoc) {
            throw new Error("Diet not found after update");
        }

        return this.mapDietDocument(updatedDoc);
    }

    async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: id });
    }

    async setActive(id: string): Promise<Diet> {
        await this.collection.updateMany(
            { _id: { $ne: id }, isActive: true },
            { $set: { isActive: false } }
        );

        const updateResult = await this.collection.updateOne(
            { _id: id },
            { $set: { isActive: true, updatedAt: new Date() } }
        );

        if (updateResult.matchedCount === 0) {
            throw new Error("Diet not found");
        }

        const activatedDoc = await this.collection.findOne({ _id: id });
        if (!activatedDoc) {
            throw new Error("Diet not found after activation");
        }

        return this.mapDietDocument(activatedDoc);
    }
}