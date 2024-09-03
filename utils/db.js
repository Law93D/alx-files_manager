import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.url = `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}`;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const db = this.client.db(this.dbName);
      const usersCollection = db.collection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      throw err;
    }
  }

  async nbFiles() {
    try {
      const db = this.client.db(this.dbName);
      const filesCollection = db.collection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      throw err;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
