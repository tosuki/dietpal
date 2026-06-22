import { MongoClient } from "mongodb";
import { MongoConnectionManager } from "../../lib/mongodb";

export abstract class MongoRepository {
    protected client: MongoClient

    constructor(
        mongoConnectionManager: MongoConnectionManager
    ) {
        this.client = mongoConnectionManager.getClient()
    }
}