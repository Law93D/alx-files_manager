import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Represents a Redis client.
 */
class RedisClient {
  /**
   * Creates a new RedisClient instance.
   */
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;

    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });

    // Promisify the Redis methods we'll be using
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if this client's connection to the Redis server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value of a given key.
   * @param {string} key - The key of the item to retrieve.
   * @returns {Promise<string | null>} - value associated with key, or null if key doesn't exist.
   */
  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Stores a key and its value along with an expiration time.
   * @param {string} key - The key of the item to store.
   * @param {string | number | boolean} value - The item to store.
   * @param {number} duration - The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    try {
      await this.setexAsync(key, duration, value);
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
    }
  }

  /**
   * Removes the value of a given key.
   * @param {string} key - The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error(`Error deleting key "${key}":`, error);
    }
  }
}

export const redisClient = new RedisClient();
export default redisClient;
