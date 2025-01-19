const express = require('express');
const pool = require('../db/db');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config'); // Import config


console.log('tickets.js loaded');


// GET ticket client details by ticket ID
router.get('/:ticketId/client', async (req, res, next) => {
    console.log(`GET /:ticketId/client - Received Request`);
    const { ticketId } = req.params;
    try {
        // Fetch the ticket
        const ticketResult = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1', [ticketId]);
        const ticket = ticketResult.rows[0];


        if (!ticket) {
          console.log(`GET /:ticketId/client - Ticket Not Found`);
            return res.status(404).json({ error: 'Ticket not found.' });
        }


        // Fetch the client associated with the ticket
        const clientResult = await pool.query('SELECT * FROM clients WHERE client_id = $1', [ticket.client_id]);
        const client = clientResult.rows[0];
         if (!client) {
           console.log(`GET /:ticketId/client - Client Not Found`);
             return res.status(404).json({ error: 'Client not found for this ticket.' });
         }


         // Fetch the movie associated with the ticket
         const movieResult = await pool.query('SELECT movie_id, title FROM movies WHERE movie_id = $1', [ticket.movie_id]);
          const movie = movieResult.rows[0];


         if (!movie) {
           console.log(`GET /:ticketId/client - Movie Not Found`);
            return res.status(404).json({ error: 'Movie not found for this ticket.' });
         }


        // Respond with client details and ticket info, also including the movie
        console.log(`GET /:ticketId/client - Sending client and ticket details`);
        res.status(200).json({
            ticket: { ...ticket, movie_title:movie.title },
             client,
        });


    } catch (error) {
        console.error(`GET /:ticketId/client - Error:`, error);
        next(error);
    }
});

/**
 * @openapi
 * /app/tickets:
 *   get:
 *     summary: Retrieve a list of all tickets
 *     tags:
 *       - Tickets
 *     responses:
 *       200:
 *         description: A list of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                    ticket_id:
 *                      type: string
 *                      example: "t1"
 *                    client_id:
 *                      type: string
 *                      example: "a-valid-client-id"
 *                    movie_id:
 *                      type: string
 *                      example: "m1"
 *                    seat_number:
 *                      type: string
 *                      example: "A1"
 *                    transport:
 *                      type: string
 *                      example: "Carpool"
 *                    snacks:
 *                      type: array
 *                      items:
 *                         type: string
 *                         example: "chips"
 *                    organization_name:
 *                         type: string
 *                         example: "some org name"
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
// GET all tickets
router.get('/', async (req, res, next) => {
    console.log('GET / - Received Request');
    try {
        const tickets = await pool.query('SELECT * FROM tickets');
        res.status(200).json(tickets.rows);
    } catch (error) {
        console.error('GET / - Error:', error);
        next(error);
    }
});


/**
 * @openapi
 * /app/tickets/{ticketId}:
 *   get:
 *     summary: Retrieve a specific ticket by ID
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         description: The ID of the ticket to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A ticket object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
  *               properties:
 *                    ticket_id:
 *                      type: string
 *                      example: "t1"
 *                    client_id:
 *                      type: string
 *                      example: "a-valid-client-id"
 *                    movie_id:
 *                      type: string
 *                      example: "m1"
 *                    seat_number:
 *                      type: string
 *                      example: "A1"
 *                    transport:
 *                      type: string
 *                      example: "Carpool"
 *                    snacks:
 *                      type: array
 *                      items:
 *                         type: string
 *                         example: "chips"
 *                    organization_name:
 *                         type: string
 *                         example: "some org name"
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ticket not found."
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
// GET specific ticket by ID
router.get('/:ticketId', async (req, res, next) => {
    console.log(`GET /:ticketId - Received Request`);
    const { ticketId } = req.params;
    try {
        const ticketResult = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1', [ticketId]);
        const ticket = ticketResult.rows[0];

        if (!ticket) {
            console.log(`GET /:ticketId - Ticket Not Found with id ${ticketId}`);
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error(`GET /:ticketId - Error:`, error);
        next(error);
    }
});

/**
 * @openapi
 * /app/tickets/{ticketId}:
 *   delete:
 *     summary: Delete a specific ticket by ID
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         description: The ID of the ticket to delete
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *                 example: "t01"
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket deleted successfully."
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ticket not found."
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

// DELETE specific ticket by ID
router.delete('/:ticketId', async (req, res, next) => {
    console.log('DELETE /:ticketId - Handler called');
    const { ticketId } = req.params;


    if (!ticketId) {
        return res.status(400).json({ error: 'Ticket ID is required in the request params.' });
    }
    let ticketCheck;
  try {
        // Check if ticket exists
        const ticketResult = await pool.query(
            'SELECT * FROM tickets WHERE ticket_id = $1',
             [ticketId]
           );
          ticketCheck = ticketResult.rows[0];


        if (!ticketCheck) {
          console.log(`DELETE /:ticketId - Ticket Not Found`);
            return res.status(404).json({ error: 'Ticket not found.' });
         }


         // Delete the ticket
        try {
          await pool.query('DELETE FROM tickets WHERE ticket_id = $1', [ticketId]);
           console.log(`DELETE /:ticketId - Ticket Deleted Successfully`);
           res.status(200).json({ message: 'Ticket deleted successfully.' });
         } catch (error) {
           console.error(`DELETE /:ticketId - Error deleting ticket with ID ${ticketId}:`, error);
            return res.status(500).json({ error: `Error deleting ticket ${ticketId}, with message ${error.message}` });
          }


    } catch (error) {
        console.error(`DELETE /:ticketId - Error fetching ticket with ID ${ticketId}:`, error);
        return res.status(500).json({error: `Error deleting ticket ${ticketId}, with message ${error.message}`});
    }
});

/**
 * @openapi
 * /app/tickets/{ticketId}:
 *   put:
 *     summary: Update a specific ticket by ID
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         description: The ID of the ticket to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie_name
 *               - seat_number
 *             properties:
 *               movie_name:
 *                 type: string
 *                 example: "Hanami"
 *               seat_number:
 *                 type: string
 *                 example: "B2"
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket updated successfully."
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     ticket_id:
 *                       type: string
 *                       example: "t1"
 *                     client_id:
 *                       type: string
 *                       example: "a-valid-client-id"
 *                     movie_id:
 *                       type: string
 *                       example: "m1"
 *                     seat_number:
 *                       type: string
 *                       example: "A1"
 *                     transport:
 *                       type: string
 *                       example: "Carpool"
 *                     snacks:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "chips"
 *                     organization_name:
 *                       type: string
 *                       example: "some org name"
 *                     movie_title:
 *                       type: string
 *                       example: "some movie title"
 *       400:
 *         description: Bad Request if parameters are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Movie name and seat number are required in the request body."
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ticket not found."
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

// PUT specific ticket details by ID
router.put('/:ticketId', async (req, res, next) => {
    console.log(`PUT /:ticketId - Received Request`);
    const { ticketId } = req.params;
    const {  movie_name, seat_number } = req.body;


     if (!movie_name || !seat_number) {
         return res.status(400).json({ error: 'Movie name and seat number are required in the request body.' });
     }




    try {
         // Check if ticket exists
          const ticketResult = await pool.query(
            'SELECT * FROM tickets WHERE ticket_id = $1',
            [ticketId]
           );
         const ticket = ticketResult.rows[0];


        if (!ticket) {
            console.log(`PUT /:ticketId - Ticket Not Found`);
            return res.status(404).json({ error: 'Ticket not found.' });
        }


          // Verify if movie exist
         const movieCheckResult = await pool.query(
            'SELECT * FROM movies WHERE title = $1',
             [movie_name]
           );
         const movieCheck = movieCheckResult.rows[0];


         if (!movieCheck) {
             console.log(`PUT /:ticketId - Movie Not Found`);
            return res.status(400).json({ error: 'Movie not found.' });
         }


         // Update the ticket
        await pool.query(
           'UPDATE tickets SET movie_id = $1, seat_number = $2 WHERE ticket_id = $3',
            [movieCheck.movie_id, seat_number, ticketId]
        );




         // Fetch the updated ticket with movie details
        const updatedTicketResult = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1', [ticketId]);
        const updatedTicket = updatedTicketResult.rows[0];
       
          // Fetch the movie associated with the ticket
        const movieResult = await pool.query('SELECT movie_id, title FROM movies WHERE movie_id = $1', [updatedTicket.movie_id]);
        const movie = movieResult.rows[0];




         if (!movie) {
           console.log(`PUT /:ticketId - Movie Not Found`);
            return res.status(404).json({ error: 'Movie not found for this ticket.' });
         }


        console.log(`PUT /:ticketId - Ticket Updated Successfully`);
        res.status(200).json({ message: 'Ticket updated successfully.', ticket:{ ...updatedTicket, movie_title:movie.title} });
    } catch (error) {
         console.error(`PUT /:ticketId - Error:`, error);
        next(error);
    }
});


/**
 * @openapi
 * /app/tickets:
 *   post:
 *     summary: Book a new ticket
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - movie_name
 *               - seat_number
 *               - transport
 *             properties:
 *               client_id:
 *                 type: string
 *                 example: "7e7f3e19-3047-49bd-bb56-25e21b6e4380"
 *               movie_name:
 *                 type: string
 *                 example: "Hanami"
 *               seat_number:
 *                 type: string
 *                 example: "A59"
 *               transport:
 *                 type: string
 *                 example: "Cinematdour"
 *               organization_name:
 *                 type: string
 *                 example: "VERMEG"
 *               snacks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Makroudh (TN)"
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket created successfully."
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     ticket_id:
 *                       type: string
 *                       example: "t1"
 *                     client_id:
 *                       type: string
 *                       example: "a-valid-client-id"
 *                     movie_id:
 *                       type: string
 *                       example: "m1"
 *                     seat_number:
 *                       type: string
 *                       example: "A1"
 *                     transport:
 *                       type: string
 *                       example: "Carpool"
 *                     snacks:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "chips"
 *                     organization_name:
 *                       type: string
 *                       example: "some org name"
 *                     movie_title:
 *                       type: string
 *                       example: "some movie title"
 *       400:
 *         description: Bad Request if parameters are missing or have incorrect values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client ID, movie name, seat number and transport are required in the request body."
 *       404:
 *         description: Client or Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found."
 *       409:
 *         description: A ticket with the same movie and seat already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "A ticket with the same movie and seat already exists."
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

router.post('/', async (req, res, next) => {
    console.log('POST / - Received Request');
     const { client_id, movie_name, seat_number, transport, snacks, organization_name } = req.body;


    if (!client_id || !movie_name || !seat_number || !transport) {
         return res.status(400).json({ error: 'Client ID, movie name, seat number and transport are required in the request body.' });
    }


    if(!config.validTransports.includes(transport) && transport !== 'No transport'){
        return res.status(400).json({ error: 'Invalid transport type. Valid options are: ' + config.validTransports.join(', ') + ', No transport' });
    }
    try {
         // Check if client exists
         console.log(`POST / - Verifying client with id ${client_id}`);
        const clientCheckResult = await pool.query(
            'SELECT * FROM clients WHERE client_id = $1',
            [client_id]
         );
        const clientCheck = clientCheckResult.rows[0];


        if (!clientCheck) {
            console.log(`POST / - Client Not Found`);
            return res.status(404).json({ error: 'Client not found.' });
        }


         // Verify if movie exist and has display_time in the future
        console.log(`POST / - Verifying movie with name ${movie_name}`);
          const movieCheckResult = await pool.query(
             'SELECT * FROM movies WHERE title = $1',
             [movie_name]
           );
         const movieCheck = movieCheckResult.rows[0];
   
       if (!movieCheck) {
          console.log(`POST / - Movie Not Found`);
            return res.status(404).json({ error: 'Movie not found.' });
       }
   


        const ticketId = `t${(await pool.query('SELECT COUNT(*) FROM tickets')).rows[0].count + 1}`;


         // Create the ticket
       console.log(`POST / - Inserting a new ticket with id ${ticketId}`);
        if ((transport === 'Cinematdour' || transport === 'PrivateBus') && (!organization_name || organization_name === "")) {
          console.log(`POST / - organization_name is required for Cinematdour or PrivateBus transports.`);
          return res.status(400).json({ error: 'Organization name is required for Cinematdour or PrivateBus transports.' });
         }




        // Check if a ticket with same movie and seat exists for that show
      const existingTicketCheck = await pool.query('SELECT * FROM tickets WHERE movie_id = $1 AND seat_number = $2', [movieCheck.movie_id, seat_number]);
        if (existingTicketCheck.rows.length > 0) {
            console.log(`POST / - A ticket with the same movie and seat already exists`);
             return res.status(409).json({ error: 'A ticket with the same movie and seat already exists.' });
        }


        await pool.query(
           'INSERT INTO tickets (ticket_id, client_id, movie_id, seat_number, transport, snacks, organization_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
           [ticketId, client_id, movieCheck.movie_id, seat_number, transport, snacks, (transport === 'Cinematdour' || transport === 'PrivateBus' ? organization_name : null)]
         );


         // Fetch the created ticket with movie details
        const createdTicketResult = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1', [ticketId]);
         const createdTicket = createdTicketResult.rows[0];
           // Fetch the movie associated with the ticket
       const movieResult = await pool.query('SELECT movie_id, title FROM movies WHERE movie_id = $1', [createdTicket.movie_id]);
       const movie = movieResult.rows[0];


         if (!movie) {
             console.log(`POST / - Movie Not Found`);
           return res.status(404).json({ error: 'Movie not found for this ticket.' });
         }




        console.log(`POST / - Ticket Created Successfully`);
         const responseTicket = { ...createdTicket, movie_title:movie.title };
         if(transport === 'Cinematdour' || transport === 'PrivateBus') {
             res.status(201).json({ message: 'Ticket created successfully.', ticket: responseTicket });
          } else {
             const { organization_name, ...ticketWithoutOrg } = responseTicket;
             res.status(201).json({ message: 'Ticket created successfully.', ticket: ticketWithoutOrg });
         }




    } catch (error) {
        console.error(`POST / - Error:`, error);
        next(error);
    }
});




   router.get('/test', (req, res) => {
          res.status(200).json({ message: 'Tickets test route working!' });
   });




module.exports = router;