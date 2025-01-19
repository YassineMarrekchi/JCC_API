const express = require('express'); //import express
const clientsRoutes = require('./clients'); //import clients routes
const ticketsRoutes = require('./tickets'); //import tickets routes
const moviesRoutes = require('./movies'); //import movies routes
const transportsRoutes = require('./transports');  //import transports routes
const snacksRoutes = require('./snacks');//import snacks routes 

const router = express.Router();

// Link all route files here
router.use('/clients', clientsRoutes);// use clients routes
router.use('/tickets', ticketsRoutes);// Use tickets routes
router.use('/movies', moviesRoutes); // Use movies routes
router.use('/transports', transportsRoutes);  //use transports routes
router.use('/snacks', snacksRoutes); //use snacks routes


/**
 * @openapi
 * /app/*:
 *   get:
 *     summary: All the valid routes are present in /app.
 *     description: Use this path as a base path to access all routes in this API.
 */

// Default route for invalid paths
router.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

module.exports = router;