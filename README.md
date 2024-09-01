Project Overview: 0x04. Files Manager
This project involves building a simple file management platform using several back-end technologies. It will cover user authentication, file handling, database management, and background processing. Here’s a summary of the key features and the structure required:

Key Features:
User Authentication: Implementing token-based authentication to manage user sessions.
File Management:
List all files.
Upload new files.
Change file permissions.
View files.
Generate thumbnails for image files.
Database Interaction:
Using MongoDB to store user and file data.
Using Redis to handle temporary data storage and caching.
Background Processing: Utilizing background jobs to handle tasks such as generating image thumbnails.
Technologies Used:
Node.js: JavaScript runtime for server-side programming.
Express.js: Web application framework for Node.js.
MongoDB: NoSQL database for storing user and file data.
Redis: In-memory data structure store for caching and session management.
Kue: Job queue for managing background tasks.
Mocha: Testing framework for JavaScript.
Nodemon: Utility that automatically restarts the server upon detecting file changes.
uuidv4: For generating unique tokens.
Setup Requirements:
Node version: 12.x.x
Development tools: ESLint for code linting, compatible editors (vi, vim, emacs, Visual Studio Code).
OS: Ubuntu 18.04 LTS
Project Structure:
utils/: Directory for utility files such as Redis and MongoDB clients.
routes/: Directory for defining API routes.
controllers/: Directory for handling business logic for various API endpoints.
Steps to Implement the Features:
0. Redis Utilities (utils/redis.js)
Class Name: RedisClient
Functions:
constructor: Initializes Redis client and handles errors.
isAlive(): Returns true if the Redis client is connected.
get(key): Retrieves a value for a given key.
set(key, value, duration): Sets a key with a value and expiry duration.
del(key): Deletes a key from Redis.
1. MongoDB Utilities (utils/db.js)
Class Name: DBClient
Functions:
constructor: Initializes MongoDB client using environment variables for host, port, and database name.
isAlive(): Checks the connection status to MongoDB.
nbUsers(): Returns the number of documents in the users collection.
nbFiles(): Returns the number of documents in the files collection.
2. Setting Up the First API
File: server.js

Endpoints: Define routes in routes/index.js

GET /status: Checks if both Redis and MongoDB are alive.
GET /stats: Returns the number of users and files.
Controller: controllers/AppController.js

getStatus: Returns the status of Redis and MongoDB connections.
getStats: Returns counts of users and files.
3. Creating a New User
Endpoint: POST /users
Controller: controllers/UsersController.js
Handles user creation, including email and password validation, and checks for existing users.
Hashes passwords using SHA1 and stores the new user in the users collection.
4. User Authentication
Endpoints:

GET /connect: Authenticates the user and returns a token.
GET /disconnect: Invalidates the user session.
GET /users/me: Retrieves information about the current user based on the token.
Controller: controllers/AuthController.js

Uses basic authentication and generates a token using uuidv4.
Stores the token in Redis for session management.
General Workflow:
Setup: Initialize the project using provided files (package.json, .eslintrc.js, babel.config.js). Install necessary dependencies using npm install.
Implement Redis and MongoDB clients: These utility classes will handle interactions with Redis and MongoDB.
Develop API Endpoints: Start by implementing the basic health check and statistics endpoints. Gradually add user-related endpoints.
Add Authentication and Authorization: Implement token-based authentication to manage user sessions.
Testing: Write test cases using Mocha to ensure all functionalities work as expected.
Background Processing: Use Kue to handle tasks such as generating thumbnails in the background.
