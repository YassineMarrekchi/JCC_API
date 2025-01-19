const express = require('express');
const pool = require('../db/db');
const router = express.Router();

console.log('movies.js loaded');


/**
 * @openapi
 * /app/movies:
 *   post:
 *     summary: Register a new movie.
 *     tags:
 *       - Movies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the movie
 *                 default: 'a valid movie title'
 *               director:
 *                 type: string
 *                 default: 'a valid director name'
 *               year:
 *                 type: integer
 *                 default: 2024
 *               genre:
 *                 type: string
 *                 default: 'drama'
 *               jcc_edition:
 *                 type: integer
 *                 default: 2024
 *               arabic_title:
 *                 type: string
 *                 default: 'arabic title'
 *     responses:
 *       201:
 *         description: Movie registered successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

// Register a new Movie
router.post('/', async (req, res, next) => {
    console.log('POST / - Received request to register a new movie');
    const { title, director, year, genre, jcc_edition, arabic_title } = req.body;

      if (!title ) {
         return res.status(400).json({ error: 'Movie title is required' });
      }
    try {
        const movieId = `m${(await pool.query('SELECT COUNT(*) FROM movies')).rows[0].count + 1}`;
         await pool.query(
           'INSERT INTO movies (movie_id, title, director, year, genre, jcc_edition, arabic_title) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [movieId, title, director, year, genre, jcc_edition, arabic_title]
          );
        console.log(`POST / - Movie with id ${movieId} created successfully`);
         res.status(201).json({ message: 'Movie registered successfully', movieId });
    } catch (error) {
        console.error(`POST / - Error creating movie:`, error);
        next(error);
    }
});


/**
 * @openapi
 * /app/movies:
 *   get:
 *     summary: Retrieve a list of all movies
 *     tags:
 *       - Movies
 *     responses:
 *       200:
 *         description: A list of all movies
 *       500:
 *         description: Internal Server Error
 */
// Get all movies
router.get('/', async (req, res, next) => {
    console.log('GET / - Received request to get all movies');
    try {
       const movies = await pool.query('SELECT * FROM movies');
        res.status(200).json(movies.rows);
    } catch (error) {
       console.error('GET / - Error fetching all movies:', error);
       next(error);
    }
});

/**
 * @openapi
 * /app/movies/{movieId}:
 *  get:
 *    summary: Get a specific movie by its ID. Also includes the number of tickets for that movie
 *    tags:
 *      - Movies
 *    parameters:
 *      - name: movieId
 *        in: path
 *        description: The ID of the movie to retrieve.
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *         description: Fetched movie successfully
 *      404:
 *        description: Movie not found
 *      500:
 *       description: Internal Server Error
 */
// Get specific movie by movie id and include the number of registrations.
router.get('/:movieId', async (req, res, next) => {
    console.log(`GET /:movieId - Received request for movie with id ${req.params.movieId}`);
    const { movieId } = req.params;
     try {
         // Fetch movie
        const movieResult = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [movieId]);
        const movie = movieResult.rows[0];

        if (!movie) {
           console.log(`GET /:movieId - Movie Not Found with id ${movieId}`);
             return res.status(404).json({ error: 'Movie not found.' });
        }

        // fetch number of tickets
        const ticketCountResult = await pool.query(
             'SELECT COUNT(*) FROM tickets WHERE movie_id = $1',
             [movieId]
           );
        const ticketCount = parseInt(ticketCountResult.rows[0].count, 10);

        console.log(`GET /:movieId - Sending movie with id ${movieId}, and count of tickets ${ticketCount}`);
        res.status(200).json({ movie, registrations: ticketCount });

    } catch (error) {
         console.error(`GET /:movieId - Error:`, error);
         next(error);
    }
});


/**
 * @openapi
 * /app/movies/{movieId}:
 *   delete:
 *     summary: Delete movie by movie ID
 *     tags:
 *       - Movies
 *     parameters:
 *       - name: movieId
 *         in: path
 *         description: The unique Id of the movie
 *         required: true
 *     responses:
 *       200:
 *        description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 */
// Delete movie using movie ID
router.delete('/:movieId', async (req, res, next) => {
  console.log(`DELETE /:movieId - Received request to delete movie with ID ${req.params.movieId}`);
  const { movieId } = req.params;
  let movieCheck;
    try {
        // Verify if movie exist
        const movieCheckResult = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [movieId]);
        movieCheck = movieCheckResult.rows[0];

        if (!movieCheck) {
          console.log(`DELETE /:movieId - Movie Not Found with id ${movieId}`);
          return res.status(404).json({ error: 'Movie not found.' });
        }
        // Delete movie
        await pool.query('DELETE FROM movies WHERE movie_id = $1', [movieId]);
        console.log(`DELETE /:movieId - Movie with ID ${movieId} deleted successfully`);
        res.status(200).json({ message: 'Movie deleted successfully.' });
    } catch (error) {
       console.error(`DELETE /:movieId - Error deleting movie with id ${movieId}:`, error);
        if(movieCheck){
            return res.status(500).json({ error: `Error deleting movie ${movieId}, with message ${error.message}` });
        } else {
           return res.status(404).json({ error: 'Movie not found.' });
        }
    }
});

/**
 * @openapi
 * /app/movies:
 *  put:
 *    summary: Update a movie by movie ID
 *    tags:
 *      - Movies
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - movie_id
 *            properties:
 *              movie_id:
 *                type: string
 *                default: m1
 *              title:
 *                type: string
 *                default: "New Movie Title"
 *              director:
 *                 type: string
 *                 default: "New Director"
 *              year:
 *                type: integer
 *                default: 2024
 *              genre:
 *                 type: string
 *                 default: "Action"
 *              jcc_edition:
 *                type: integer
 *                default: 2024
 *              arabic_title:
 *                type: string
 *                default: "اسم الفيلم الجديد"
 *    responses:
 *      200:
 *        description: Movie modified successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Internal Server Error
 */
router.put('/', async (req, res, next) => {
  console.log(`PUT / - Received request to update a movie`);
   const { movie_id, title, director, year, genre, jcc_edition, arabic_title } = req.body;

    if (!movie_id || !title ) {
        return res.status(400).json({ error: 'Movie id, and title are required.' });
    }

   try {
       // Check if movie exists
       const movieCheckResult = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [movie_id]);
       const movieCheck = movieCheckResult.rows[0];

       if (!movieCheck) {
           console.log(`PUT /:movieId - Movie not found with id ${movie_id}`);
           return res.status(404).json({ error: 'Movie not found.' });
       }

       // Update the movie
       await pool.query(
           'UPDATE movies SET title = $1, director = $2, year = $3, genre = $4, jcc_edition = $5, arabic_title = $6 WHERE movie_id = $7',
            [title, director, year, genre, jcc_edition, arabic_title, movie_id]
       );
       console.log(`PUT /:movieId - Movie updated successfully with id ${movie_id}`);
        res.status(200).json({ message: 'Movie updated successfully.' });
    } catch (error) {
      console.error(`PUT /:movieId - Error updating movie with id ${movie_id}:`, error);
        next(error);
    }
});

module.exports = router;