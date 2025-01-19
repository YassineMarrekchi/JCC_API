const express = require('express');
const pool = require('../db/db');
const router = express.Router();

console.log('snacks.js loaded');

/**
 * @openapi
 * /app/snacks:
 *   post:
 *     summary: Register a new snack.
 *     tags:
 *       - Snacks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - snack_type
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 default: 'a valid name'
 *               snack_type:
 *                 type: string
 *                 default: 'drink'
 *               price:
 *                 type: number
 *                 default: 5.000
 *     responses:
 *       201:
 *         description: Snack created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Snack registered successfully!"
 *       400:
 *         description: Bad Request if name, snack_type, or price are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "name, snack_type, and price are required"
 *       409:
 *         description: A snack with the same name is already present.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "A snack with the same name already exists."
 *       422:
 *         description: Boycott name detected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Boycott for a Better Future 🍉."
 *       500:
 *         description: Internal Server Error if something went wrong when saving to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
// Create a new snack
router.post('/', async (req, res, next) => {
  console.log('POST / - Received request to register a new snack');
  const { name, snack_type, price } = req.body;

  if (!name || !snack_type || !price) {
      return res.status(400).json({ error: 'name, snack_type, and price are required' });
  }

  try {
    // Check if a similar snack name exists in the boycott table by normalizing names
    const boycottCheckResult = await pool.query(
      "SELECT * FROM boycott WHERE replace(lower(product_name), ' ', '') = replace(lower($1), ' ', '')",
      [name]
    );

    if (boycottCheckResult.rows.length > 0) {
      console.log(`POST / - Snack name ${name} is listed for boycott`);
      return res.status(422).json({ error: 'Boycott for a Better Future 🍉.' });
    }

    // Verify that the snack does not exist before creation
    const existingSnackCheckResult = await pool.query('SELECT * FROM snacks WHERE name = $1', [name]);
    if (existingSnackCheckResult.rows[0]) {
      console.log(`POST / - A snack with name ${name} already exists`);
      return res.status(409).json({ error: `A snack with the same name already exists.` });
    }

    await pool.query(
      'INSERT INTO snacks (name, snack_type, price) VALUES ($1, $2, $3)',
      [name, snack_type, price]
    );

    console.log(`POST / - Snack created successfully with name: ${name}`);
    res.status(201).json({ message: 'Snack registered successfully!' });

  } catch (error) {
    console.error(`POST / - Error:`, error);
    next(error);
  }
});

/**
 * @openapi
 * /app/snacks:
 *   get:
 *     summary: Get a list of all snacks.
 *     tags:
 *       - Snacks
 *     responses:
 *       200:
 *         description: Returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     default: "popcorn"
 *                   snack_type:
 *                     type: string
 *                     default: 'food'
 *                   price:
 *                     type: number
 *                     default: 2.200
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
  console.log(`GET / - Received request to get all snacks`);
    try {
         const snacks = await pool.query('SELECT * FROM snacks');
       console.log('GET / - sending all snacks successfully');
         res.status(200).json(snacks.rows);
   } catch (error) {
        console.error('GET / - Error fetching all snacks:', error);
         next(error);
     }
});

/**
 * @openapi
 * /app/snacks/{name}:
 *   get:
 *     summary: Get a specific snack by name.
 *     tags:
 *       - Snacks
 *     parameters:
 *       - name: name
 *         in: path
 *         description: The name of the snack you want to retrieve from your db.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fetch snack correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "popcorn"
 *                 snack_type:
 *                   type: string
 *                   example: "food"
 *                 price:
 *                   type: number
 *                   example: 2.200
 *       404:
 *         description: Snack not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Snack not found."
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

// Get Specific Snack by name
router.get('/:name', async (req, res, next) => {
     console.log(`GET /:name - Received request to fetch snack with name: ${req.params.name}`);
    const { name } = req.params;
   try {
         const result = await pool.query('SELECT * FROM snacks WHERE name = $1', [name]);
          const snack = result.rows[0];
     if (!snack) {
         console.log(`GET /:name - Snack not found with name ${name}`);
            return res.status(404).json({ error: 'Snack not found.' });
         }
       console.log(`GET /:name - Sending details for snack with name: ${name}`);
      res.status(200).json(snack);
    } catch (error) {
       console.error(`GET /:name - Error:`, error);
        next(error);
    }
});

/**
 * @openapi
 * /app/snacks/{name}:
 *   delete:
 *     summary: Delete specific snack by name.
 *     tags:
 *       - Snacks
 *     parameters:
 *       - name: name
 *         in: path
 *         description: The name of the snack to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Snack deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Snack deleted successfully."
 *       404:
 *         description: Not found when no records for this snack were found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Snack not found."
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.delete('/:name', async (req, res, next) => {
  console.log(`DELETE /:name - Received request to delete a snack with name ${req.params.name}`);
  const { name } = req.params;
    let snackCheck;

    try {
      // Verify if snack exist
      const snackCheckResult = await pool.query('SELECT * FROM snacks WHERE name = $1', [name]);
         snackCheck = snackCheckResult.rows[0];

        if (!snackCheck) {
            console.log(`DELETE /:name - Snack not found with name ${name}`);
            return res.status(404).json({ error: 'Snack not found.' });
        }

       // Delete snack
       await pool.query('DELETE FROM snacks WHERE name = $1', [name]);
       console.log(`DELETE /:name - Snack with name ${name} deleted succesfully`);
        res.status(200).json({ message: 'Snack deleted successfully.' });

    } catch (error) {
        console.error(`DELETE /:snackId - Error deleting snack with name ${name}:`, error);
          if (snackCheck) {
            return res.status(500).json({ error: `Error deleting snack with name ${name}, with message ${error.message}`});
          } else {
            return res.status(404).json({ error: 'Snack not found.' });
         }
        next(error);
   }
});
/**
 * @openapi
 * /app/snacks:
 *   put:
 *     summary: Updates a snack by name
 *     tags:
 *       - Snacks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 default: "test"
 *               snack_type:
 *                 type: string
 *                 default: 'drink'
 *               price:
 *                 type: number
 *                 default: 5.000
 *     responses:
 *       200:
 *         description: Snack updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Snack updated successfully."
 *       400:
 *         description: Bad request if data is missing or not formatted correctly.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "name, snack_type, and price are required."
 *       404:
 *         description: Not found if the provided snack name does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Snack not found."
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

// Update transport by transport name
router.put('/', async (req, res, next) => {
   console.log(`PUT / - Received request to update a snack`);
   const { name, snack_type, price } = req.body;
    if (!name || !snack_type || !price) {
        return res.status(400).json({ error: 'name, snack_type, and price are required.' });
    }
   let snackCheck;
  try {
         // Verify if snack exists
        const snackCheckResult = await pool.query('SELECT * FROM snacks WHERE name = $1', [name]);
       snackCheck = snackCheckResult.rows[0];


     if (!snackCheck) {
           console.log(`PUT / - Snack not found with name: ${name}`);
          return res.status(404).json({ error: 'Snack not found.' });
      }

       // Update snack
       await pool.query(
          'UPDATE snacks SET snack_type = $1, price = $2 WHERE name = $3',
          [snack_type, price, name]
         );
         console.log(`PUT /:snackId - Snack with name ${name} updated succesfully`);
       res.status(200).json({ message: 'Snack updated successfully.' });

    } catch (error) {
          console.error(`PUT /:name - Error updating snack with id: ${name}`, error);
         if(snackCheck){
             return res.status(500).json({ error: `Error updating snack with name ${name}, with message: ${error.message}`});
           } else {
             return res.status(404).json({ error: 'Snack not found.' });
          }
         next(error);
      }
});
module.exports = router;