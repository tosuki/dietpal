import { MongoClient } from "mongodb"
import { env } from "../config/env"

export class MongoConnectionManager {
    private client: MongoClient | null = null

    getClient(): MongoClient {
        if (!this.client) {
            throw new Error("Database is not connected to mongodb servers")
        }

        return this.client
    }

    async connect() {
        if (this.client) {
            return
        }

        this.client = new MongoClient(env.MONGODB_URI)
        await this.client.connect()
    }

    async close() {
        if (!this.client) {
            throw new Error("Not conencted")
        }

        await this.client.close()
    }
}
