import redis from 'redis';
import { promisify } from 'util';

/**
 * Class for Redis service
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Handle Redis connection errors
    this.client.on('error', (error) => {
      console.error(`Redis client not connected to the server: ${error.message}`);
    });

    // Handle Redis connection success
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });
  }

  /**
   * Checks if connection to Redis is alive
   * @return {boolean} true if connection alive, or false if not
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets value corresponding to key in Redis
   * @param {string} key - Key to search for in Redis
   * @return {Promise<string|null>} - Value of key, or null if not found
   */
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting key "${key}": ${error.message}`);
      return null;
    }
  }

  /**
   * Creates a new key in Redis with a specific TTL
   * @param {string} key - Key to be saved in Redis
   * @param {string|number} value - Value to assign to key
   * @param {number} duration - TTL of key in seconds
   * @return {Promise<void>}
   */
  async set(key, value, duration) {
    try {
      await this.setexAsync(key, duration, value);
    } catch (error) {
      console.error(`Error setting key "${key}": ${error.message}`);
    }
  }

  /**
   * Deletes key in Redis service
   * @param {string} key - Key to be deleted
   * @return {Promise<void>}
   */
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error(`Error deleting key "${key}": ${error.message}`);
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
