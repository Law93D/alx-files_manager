import createClient from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();

        this.client.on('error', (error) => {
            console.error(`Redis client not connected to the server: ${error.message}`);
        });

        this.client.on('connect', () => {
            console.log('Redis client connected to the server');
        });

        this.client.connect().catch((error) => {
            console.error(`Error connecting to Redis server: ${error.message}`);
        });
    }

    isAlive() {
        return this.client.isReady; // Checking if the client is ready
    }

    async get(key) {
        try {
            const value = await this.client.get(key); // Use async/await directly
            return value;
        } catch (error) {
            console.error(`Error getting key ${key}: ${error.message}`);
            throw error;
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.setEx(key, duration, value); // Use setEx directly for setting with expiration
        } catch (error) {
            console.error(`Error setting key ${key}: ${error.message}`);
            throw error;
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`Error deleting key ${key}: ${error.message}`);
            throw error;
        }
    }

    async quit() {
        try {
            await this.client.quit();
            console.log('Redis client connection closed');
        } catch (error) {
            console.error(`Error closing Redis client connection: ${error.message}`);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;
