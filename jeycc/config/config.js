// config/config.js
require('dotenv').config();

module.exports = {
  db: {
    user: process.env.DB_USER ,
    host: process.env.DB_HOST ,
    database: process.env.DB_NAME ,
    password: process.env.DB_PASSWORD ,
    port: parseInt(process.env.DB_PORT , 10) ,
  },
  validTransports: ['Carpool', 'PrivateBus', 'Cinematdour'],
};