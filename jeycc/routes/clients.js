const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/db');
const router = express.Router();

console.log('clients.js loaded');

/**
 * @openapi
 * /app/clients/register:
 *   post:
 *     summary: Register a new client.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 default: 'John'
 *               lastName:
 *                 type: string
 *                 default: 'Doe'
 *               phone:
 *                 type: string
 *                 default: '123-456-7890'
 *               email:
 *                 type: string
 *                 format: email
 *                 default: 'john.doe@example.com'
 *     responses:
 *       201:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client registered successfully!"
 *                 clientId:
 *                   type: string
 *                   example: "a-uuid-client-id"
 *       400:
 *         description: Bad Request if parameters are missing or have incorrect values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "First name, last name, phone, and email are required."
 *       409:
 *         description: Conflict if a client with the email or phone already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "This email is already in use."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.post('/register', async (req, res, next) => {
    console.log('POST /register - Received Request');
    const { firstName, lastName, phone, email } = req.body;

    if (!firstName || !lastName || !phone || !email) {
        return res.status(400).json({ error: 'First name, last name, phone, and email are required.' });
    }

    try {
        if(req.body.clientId) {
            const existingClientById = await pool.query('SELECT * FROM clients WHERE client_id = $1', [req.body.clientId]);

            if (existingClientById.rows.length > 0) {
                return res.status(409).json({ error: 'A client with this ID already exists.' });
            }
        }

        const existingClientByEmailResult = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        const existingClientByEmail = existingClientByEmailResult.rows[0];
        if (existingClientByEmail) {
            return res.status(409).json({ error: 'This email is already in use.' });
        }

        const existingClientByPhoneResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [phone]);
        const existingClientByPhone = existingClientByPhoneResult.rows[0];
        if (existingClientByPhone) {
            return res.status(409).json({ error: 'This phone number is already in use.' });
        }

        const clientId = uuidv4();

        await pool.query('INSERT INTO clients (client_id, first_name, last_name, phone, email) VALUES ($1, $2, $3, $4, $5)', 
            [clientId, firstName, lastName, phone, email]);
        res.status(201).json({
            message: 'Client registered successfully!',
            clientId,
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /app/clients:
 *   get:
 *     summary: Retrieve a list of all clients.
 *     tags:
 *       - Clients
 *     responses:
 *       200:
 *         description: A list of clients.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   clientId:
 *                     type: string
 *                     example: "a-valid-client-id"
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   phone:
 *                     type: string
 *                     example: "123-456-7890"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "john.doe@example.com"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get('/', async (req, res, next) => {
    console.log('GET / - Received Request');
    try {
        const clients = await pool.query('SELECT * FROM clients');
        res.json(clients.rows);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /app/clients/{clientId}:
 *   get:
 *     summary: Retrieve details of a specific client by ID.
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: clientId
 *         description: The ID of the client to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A client object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientId:
 *                   type: string
 *                   example: "a-valid-client-id"
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 phone:
 *                   type: string
 *                   example: "123-456-7890"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *       404:
 *         description: Client not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get('/:clientId', async (req, res, next) => {
    const { clientId } = req.params;
    try {
        const client = await pool.query('SELECT * FROM clients WHERE client_id = $1', [clientId]);

        if (client.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found.' });
        }

        res.json(client.rows[0]);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /app/clients:
 *   delete:
 *     summary: Delete a client by ID.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: "a-valid-client-id"
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client deleted successfully."
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.delete('/', async (req, res, next) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required.' });
    }

    try {
        const clientCheckResult = await pool.query('SELECT * FROM clients WHERE client_id = $1', [clientId]);
        const clientCheck = clientCheckResult.rows[0];

        if (!clientCheck) {
            return res.status(404).json({ error: 'Client not found.' });
        }

        await pool.query('DELETE FROM clients WHERE client_id = $1', [clientId]);
        res.status(200).json({ message: 'Client and related tickets deleted successfully.' });

    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /app/clients:
 *   put:
 *     summary: Update a client by ID.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: "a-valid-client-id"
 *               firstName:
 *                 type: string
 *                 default: "UpdatedFirstName"
 *               lastName:
 *                 type: string
 *                 default: "UpdatedLastName"
 *               phone:
 *                 type: string
 *                 default: "987-654-3210"
 *               email:
 *                 type: string
 *                 default: "updated.email@example.com"
 *     responses:
 *       200:
 *         description: Client updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client updated successfully."
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client ID, first name, last name, phone, and email are required."
 *       404:
 *         description: Client not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.put('/', async (req, res, next) => {
    const { clientId, firstName, lastName, phone, email } = req.body;

    if (!clientId || !firstName || !lastName || !phone || !email) {
        return res.status(400).json({ error: 'Client ID, first name, last name, phone, and email are required.' });
    }

    try {
        const clientCheckResult = await pool.query('SELECT * FROM clients WHERE client_id = $1', [clientId]);
        const clientCheck = clientCheckResult.rows[0];

        if (!clientCheck) {
            return res.status(404).json({ error: 'Client not found.' });
        }

        await pool.query('UPDATE clients SET first_name = $1, last_name = $2, phone = $3, email = $4 WHERE client_id = $5',
            [firstName, lastName, phone, email, clientId]);

        res.status(200).json({ message: 'Client updated successfully.' });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
