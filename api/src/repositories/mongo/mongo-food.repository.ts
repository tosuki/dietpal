import { IFoodRepository } from "../food.repository.interface";
import { Food } from "../types";
import { MongoRepository } from "./mongo.repository";

export class MongoDBFoodRepository extends MongoRepository implements IFoodRepository {
    search(query: string): Promise<Food[]> {
        throw new Error("Method not implemented.");
    }
    findByName(name: string): Promise<Food | null> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Food | null> {
        throw new Error("Method not implemented.");
    }
    createCustom(data: { name: string; calories: number; protein: number; carbs: number; fat: number; }): Promise<Food> {
        throw new Error("Method not implemented.");
    }
    deleteCustom(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}