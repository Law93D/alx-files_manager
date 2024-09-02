import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redisClient';

/**
 * Controller for handling authentication operations.
 */
class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.slice('Basic '.length).trim();
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Hash the password
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Check if user exists
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token
      const token = uuidv4();
      const redisKey = `auth_${token}`;

      // Store user ID in Redis
      await redisClient.set(redisKey, user._id.toString(), 'EX', 86400); // 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.error(`Error during sign-in: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;

    try {
      // Check if token exists in Redis
      const userId = await redisClient.get(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete token from Redis
      await redisClient.del(redisKey);

      return res.status(204).send();
    } catch (error) {
      console.error(`Error during sign-out: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
