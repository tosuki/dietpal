import { IDietRepository } from "../diet.repository.interface"
import { Diet, CreateDietInput } from "../types";

import { env } from "../../config/env"
import { MongoRepository } from "./mongo.repository";

export class MongoDBDietRepository extends MongoRepository implements IDietRepository {
    listAll(): Promise<Omit<Diet, "meals">[]> {
        throw new Error("Method not implemented.");
    }

    findActive(): Promise<Diet | null> {
        throw new Error("Method not implemented.");
    }

    findById(id: string): Promise<Diet | null> {
        throw new Error("Method not implemented.");
    }

    create(data: CreateDietInput): Promise<Diet> {
        throw new Error("Method not implemented.");
    }

    update(id: string, data: CreateDietInput): Promise<Diet> {
        throw new Error("Method not implemented.");
    }

    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    setActive(id: string): Promise<Diet> {
        throw new Error("Method not implemented.");
    }
}