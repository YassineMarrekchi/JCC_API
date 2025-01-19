// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Jeycc API',
        version: '1.0.0',
        description: 'API for the Jeycc application.',
      },
       servers: [
          {
            url: 'http://localhost:3001',
          },
       ],
    },
    apis: ['./routes/*.js'], // Path to your route files
  };

  const swaggerSpec = swaggerJsdoc(options);

  module.exports = swaggerSpec;