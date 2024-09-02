import express from 'express';
import mapRoutes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Load routes from routes/index.js
mapRoutes(app);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
module.exports = app;
