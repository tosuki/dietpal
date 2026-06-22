import { MongoClient, Db } from "mongodb";
import { MongoConnectionManager } from "../../lib/mongodb";

export abstract class MongoRepository {
    protected client: MongoClient

    constructor(
        mongoConnectionManager: MongoConnectionManager
    ) {
        this.client = mongoConnectionManager.getClient()
        this.init()
    }

    protected get db(): Db {
        return this.client.db();
    }

    abstract init(): Promise<any> | any;
}