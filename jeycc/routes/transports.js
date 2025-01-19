const express = require('express');
const pool = require('../db/db');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); //Import uuidv4


console.log('transports.js loaded');

/**
 * @openapi
 * /app/transports:
 *   post:
 *     summary: Register a new transport.
 *     tags:
 *       - Transports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - transport_type
 *               - capacity
 *               - availability
 *               - student_institutional_price
 *               - general_price
 *             properties:
 *               name:
 *                 type: string
 *                 default: 'a valid name'
 *               transport_type:
 *                 type: string
 *                 default: 'Carpool'
 *               capacity:
 *                 type: integer
 *                 default: 4
 *               availability:
 *                 type: boolean
 *                 default: true
 *               student_institutional_price:
 *                 type: number
 *                 default: 15.000
 *               general_price:
 *                 type: number
 *                 default: 20.000
 *               agent_name:
 *                 type: string
 *                 default: 'a valid agent name'
 *     responses:
 *       201:
 *         description: Transport created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Transport registered successfully'
 *                 transportId:
 *                   type: string
 *                   example: 'm1'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "transport_type, name, capacity, availability, student_institutional_price, and general_price are required."
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

// Register a new transport
router.post('/', async (req, res, next) => {
  console.log('POST / - Received request to register a new transport');
  const { transport_type, name, capacity, availability, student_institutional_price, general_price, agent_name } = req.body;

  if (!transport_type || !name || !capacity || !availability || !student_institutional_price || !general_price) {
      return res.status(400).json({ error: 'transport_type, name, capacity, availability, student_institutional_price, and general_price are required.' });
  }
      
 try {
    // Check if transport exists, using the information provided.
     const existingTransportCheckResult = await pool.query(
        'SELECT * FROM transports WHERE transport_type = $1 AND name = $2 AND capacity = $3 AND availability = $4 AND student_institutional_price = $5 AND general_price = $6',
       [transport_type, name, capacity, availability, student_institutional_price, general_price]
         );
    const existingTransportCheck = existingTransportCheckResult.rows[0];
     if (existingTransportCheck) {
          console.log(`POST / - A transport with the same name, type, capacity, availability, student_institutional_price, and general_price already exists.`);
          return res.status(409).json({ error: 'A transport with the same name, type, capacity, availability, student_institutional_price, and general_price already exists.' });
       }
     const transportId = `tp${(await pool.query('SELECT COUNT(*) FROM transports')).rows[0].count + 1}`;
             await pool.query(
            'INSERT INTO transports (transport_id, transport_type, name, capacity, availability, student_institutional_price, general_price, agent_id, agent_name) VALUES ($1, $2, $3, $4, $5, $6, $7, uuid_generate_v4(), $8)',
           [transportId, transport_type, name, capacity, availability, student_institutional_price, general_price, agent_name]
       );
      console.log(`POST / - Transport with id ${transportId} created successfully`);
    res.status(201).json({ message: 'Transport registered successfully', transportId });
   } catch (error) {
        console.error(`POST / - Error creating transport:`, error);
     next(error);
  }
});

/**
 * @openapi
 * /app/transports:
 *   get:
 *     summary: Retrieve a list of all transports
 *     tags:
 *       - Transports
 *     responses:
 *       200:
 *         description: A list of all transports
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  error:
 *                    type: string
 *                    example: "Internal Server Error"
 */
// Get all transports
router.get('/', async (req, res, next) => {
   console.log('GET / - Received request to get all transports');
    try {
       const transports = await pool.query('SELECT * FROM transports');
         res.status(200).json(transports.rows);
    } catch (error) {
      console.error('GET / - Error fetching all transports:', error);
      next(error);
    }
});

/**
 * @openapi
 * /app/transports/{transportId}:
 *  get:
 *    summary: Get a specific transport by its ID
 *    tags:
 *      - Transports
 *    parameters:
 *      - name: transportId
 *        in: path
 *        description: The ID of the transport to retrieve.
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *         description: Fetched transport successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *      404:
 *        description: Transport not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Transport not found."
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
// Get specific transport by transport id
router.get('/:transportId', async (req, res, next) => {
    console.log(`GET /:transportId - Received request for transport with id ${req.params.transportId}`);
    const { transportId } = req.params;
     try {
          const transportResult = await pool.query('SELECT * FROM transports WHERE transport_id = $1', [transportId]);
          const transport = transportResult.rows[0];

        if (!transport) {
           console.log(`GET /:transportId - Transport Not Found with id ${transportId}`);
             return res.status(404).json({ error: 'Transport not found.' });
        }
          console.log(`GET /:transportId - Sending transport with id ${transportId}`);
        res.status(200).json(transport);
    } catch (error) {
        console.error(`GET /:transportId - Error:`, error);
        next(error);
     }
});

/**
 * @openapi
 * /app/transports/{transportId}:
 *   delete:
 *     summary: Delete transport by transport ID
 *     tags:
 *       - Transports
 *     parameters:
 *       - name: transportId
 *         in: path
 *         description: The unique Id of the transport
 *         required: true
 *     responses:
 *       200:
 *         description: Transport deleted successfully
 *         content:
 *           application/json:
 *              schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transport deleted successfully."
 *       404:
 *         description: Transport not found
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Transport not found."
 *       500:
 *         description: Internal Server Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
// Delete transport using transport ID
router.delete('/:transportId', async (req, res, next) => {
    console.log(`DELETE /:transportId - Received request to delete transport with ID ${req.params.transportId}`);
    const { transportId } = req.params;
    let transportCheck;
    try {
        // Verify if transport exist
        const transportCheckResult = await pool.query('SELECT * FROM transports WHERE transport_id = $1', [transportId]);
         transportCheck = transportCheckResult.rows[0];

       if (!transportCheck) {
           console.log(`DELETE /:transportId - Transport Not Found with id ${transportId}`);
           return res.status(404).json({ error: 'Transport not found.' });
         }
         // Delete transport
        await pool.query('DELETE FROM transports WHERE transport_id = $1', [transportId]);
        console.log(`DELETE /:transportId - Transport with id ${transportId} deleted successfully`);
        res.status(200).json({ message: 'Transport deleted successfully.' });
    } catch (error) {
       console.error(`DELETE /:transportId - Error deleting transport with id ${transportId}:`, error);
        if(transportCheck){
           return res.status(500).json({ error: `Error deleting transport ${transportId}, with message ${error.message}` });
        } else {
            return res.status(404).json({ error: 'Transport not found.' });
        }
    }
});


/**
 * @openapi
 * /app/transports:
 *  put:
 *    summary: Update a transport by transport ID
 *    tags:
 *      - Transports
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - transport_id
 *            properties:
 *               transport_id:
 *                 type: string
 *                 default: 'm1'
 *               name:
 *                 type: string
 *                 default: 'Updated Transport Name'
 *               transport_type:
 *                 type: string
 *                 default: 'Carpool'
 *               capacity:
 *                 type: integer
 *                 default: 4
 *               availability:
 *                 type: boolean
 *                 default: true
 *               student_institutional_price:
 *                 type: number
 *                 default: 15.000
 *               general_price:
 *                 type: number
 *                 default: 20.000
 *               agent_name:
 *                 type: string
 *                 default: 'a valid agent name'
 *    responses:
 *      200:
 *        description: Transport updated successfully
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transport updated successfully."
 *      400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "transport_id, name, transport_type, capacity, availability, student_institutional_price, and general_price are required."
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Transport not found."
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Internal Server Error"
 */

// Update transport by transport ID
router.put('/', async (req, res, next) => {
     console.log(`PUT / - Received request to update a transport`);
    const { transport_id, name, transport_type, capacity, availability, student_institutional_price, general_price, agent_name  } = req.body;

    if (!transport_id || !name || !transport_type || !capacity || !availability || !student_institutional_price || !general_price) {
        return res.status(400).json({ error: 'transport_id, name, transport_type, capacity, availability, student_institutional_price, and general_price are required' });
    }

    try {
           // Check if transport exists
         const transportCheckResult = await pool.query('SELECT * FROM transports WHERE transport_id = $1', [transport_id]);
        const transportCheck = transportCheckResult.rows[0];

        if (!transportCheck) {
             console.log(`PUT /:transportId - Transport not found with id ${transport_id}`);
             return res.status(404).json({ error: 'Transport not found.' });
       }

         // Update the transport
         await pool.query(
            'UPDATE transports SET name = $1, transport_type = $2, capacity = $3, availability = $4, student_institutional_price = $5, general_price = $6, agent_name = $7 WHERE transport_id = $8',
            [name, transport_type, capacity, availability, student_institutional_price, general_price, agent_name, transport_id]
          );
         console.log(`PUT /:transportId - Transport updated succesfully with id ${transport_id}`);
        res.status(200).json({ message: 'Transport updated successfully.' });
    } catch (error) {
       console.error(`PUT /:transportId - Error updating transport with id ${transport_id}:`, error);
        next(error);
    }
});

module.exports = router;
