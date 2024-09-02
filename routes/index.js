import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

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
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

export default mapRoutes;
module.exports = mapRoutes;
