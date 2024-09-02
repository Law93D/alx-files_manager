import crypto from 'crypto';
import dbClient from '../utils/db';

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
        return res.status(400).json({ error: 'Already exist' });
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
}

export default UsersController;
