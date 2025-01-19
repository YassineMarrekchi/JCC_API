const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Import swaggerSpec
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000; // Ensure this matches the port used in the frontend

// Middleware
app.use(cors());
app.use(express.json());

// Mount Swagger UI before mounting other routes
app.use('/app/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Explicitly mount routes to the /app base path
const apiRouter = express.Router();
apiRouter.use(routes);
app.use('/app', apiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/app/api-docs`);
});