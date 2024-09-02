import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redisClient';

/**
 * Controller for handling user-related operations.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Create new user
      const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

      // Return new user
      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;

    try {
      // Retrieve user ID from Redis
      const userId = await redisClient.get(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve user from DB
      const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return user data
      return res.status(200).json({
        id: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error(`Error retrieving user: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
