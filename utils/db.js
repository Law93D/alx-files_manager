import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    // Updated connection string to use the constructed URL variable
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Improved error handling with async/await and try/catch
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('MongoDB client connected to the server');
      })
      .catch((err) => {
        console.error(`MongoDB client not connected to the server: ${err.message}`);
      });
  }

  // Updated isAlive method to check the connection state using topology
  isAlive() {
    return this.client.topology.isConnected();
  }

  // Asynchronous method to count users in the database
  async nbUsers() {
    if (!this.isAlive()) return 0; // Check if connection is alive before querying
    return this.db.collection('users').countDocuments();
  }

  // Asynchronous method to count files in the database
  async nbFiles() {
    if (!this.isAlive()) return 0; // check is conn is alive before querying
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
