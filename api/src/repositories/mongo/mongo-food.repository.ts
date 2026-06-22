import { Collection } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { IFoodRepository } from "../food.repository.interface";
import { Food } from "../types";
import { MongoRepository } from "./mongo.repository";

interface FoodDocument {
    _id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    isCustom: boolean;
    createdAt: Date;
}

export class MongoDBFoodRepository extends MongoRepository implements IFoodRepository {
    private get collection(): Collection<FoodDocument> {
        return this.db.collection<FoodDocument>("foods");
    }

    async init() {
        try {
            await this.collection.createIndex({ name: 1 }, { unique: true });
        } catch (error) {
            console.error("Erro ao criar índice único de nome em foods:", error);
        }
    }

    async search(query: string): Promise<Food[]> {
        const docs = await this.collection
            .find({ name: { $regex: query, $options: 'i' } })
            .sort({ name: 1 })
            .limit(50)
            .toArray();

        return docs.map(doc => ({
            id: doc._id.toString(),
            name: doc.name,
            calories: doc.calories,
            protein: doc.protein,
            carbs: doc.carbs,
            fat: doc.fat,
            isCustom: doc.isCustom,
            createdAt: doc.createdAt,
        }));
    }

    async findByName(name: string): Promise<Food | null> {
        const doc = await this.collection.findOne({ name });
        if (!doc) return null;

        return {
            id: doc._id.toString(),
            name: doc.name,
            calories: doc.calories,
            protein: doc.protein,
            carbs: doc.carbs,
            fat: doc.fat,
            isCustom: doc.isCustom,
            createdAt: doc.createdAt,
        };
    }

    async findById(id: string): Promise<Food | null> {
        const doc = await this.collection.findOne({ _id: id });
        if (!doc) return null;

        return {
            id: doc._id.toString(),
            name: doc.name,
            calories: doc.calories,
            protein: doc.protein,
            carbs: doc.carbs,
            fat: doc.fat,
            isCustom: doc.isCustom,
            createdAt: doc.createdAt,
        };
    }

    async createCustom(data: { name: string; calories: number; protein: number; carbs: number; fat: number; }): Promise<Food> {
        const id = uuidv4();
        const createdAt = new Date();
        const doc = {
            _id: id,
            name: data.name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            isCustom: true,
            createdAt,
        };

        await this.collection.insertOne(doc);

        return {
            id,
            name: data.name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            isCustom: true,
            createdAt,
        };
    }

    async deleteCustom(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: id });
    }
}