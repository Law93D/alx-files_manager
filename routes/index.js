import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

/**
 * Binds the routes to the appropriate handler in the
 * given Express application...
 * @param {Express} app, The Express application.
 *
 * */
const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/status', AppController.getStats);
};

const router = express.Router();

router.post('/users', UsersController.postNew);

export default mapRoutes;
module.exports = mapRoutes;
