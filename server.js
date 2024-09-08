import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;
const mapRoutes = require('./routes/index');

// Load routes from routes/index.js
mapRoutes(app);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
module.exports = app;
