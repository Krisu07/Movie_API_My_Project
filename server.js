import express from 'express';
import { pgPool } from './pg_connection.js';

const app = express();
app.use(express.json());

// 1. Add new genre
app.post('/genres', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pgPool.query('INSERT INTO genres (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. Add new movie
app.post('/movies', async (req, res) => {
    const { name, year, genreid } = req.body;
    try {
        const result = await pgPool.query(
            'INSERT INTO movies (name, year, genreid) VALUES ($1, $2, $3) RETURNING *',
            [name, year, genreid]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Register user
app.post('/users', async (req, res) => {
    const { name, username, password, yearofbirth } = req.body;
    try {
        const result = await pgPool.query(
            'INSERT INTO users (name, username, password, yearofbirth) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, username, password, yearofbirth]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Get movie by ID
app.get('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pgPool.query('SELECT * FROM movies WHERE movieid = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. Remove movie by ID
app.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pgPool.query('DELETE FROM movies WHERE movieid = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Movie deleted', movie: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 6. Paginate movies
app.get('/movies', async (req, res) => {
    const { page = 1 } = req.query; // Default page = 1
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const result = await pgPool.query('SELECT * FROM movies LIMIT $1 OFFSET $2', [limit, offset]);
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 7. Search movies by keyword
app.get('/movies/search', async (req, res) => {
    const { keyword } = req.query; // Retrieve the keyword query parameter
    if (!keyword) {
        return res.status(400).json({ error: "Keyword is required" });
    }
    try {
        // Use ILIKE for case-insensitive search and % for partial matching
        const result = await pgPool.query(
            'SELECT * FROM movies WHERE name ILIKE $1',
            [`%${keyword}%`]  // Wrap the keyword with wildcards
        );
        res.json(result.rows);  // Return the search results
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 8. Add movie review
app.post('/reviews', async (req, res) => {
    const { username, stars, review_text, movieid } = req.body;
    try {
        const result = await pgPool.query(
            'INSERT INTO reviews (username, stars, reviewtext, movieid) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, stars, reviewtext, movieid]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 9. Add favorite movies
app.post('/favorites', async (req, res) => {
    const { userid, movieid } = req.body;
    try {
        const result = await pgPool.query(
            'INSERT INTO favorites (userid, movieid) VALUES ($1, $2) RETURNING *',
            [userid, movieid]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 10. Get favorite movies by username
app.get('/favorites/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pgPool.query(
            `SELECT movies.* 
             FROM favorites 
             JOIN users ON favorites.userid = users.userid 
             JOIN movies ON favorites.movieid = movies.movieid 
             WHERE users.username = $1`,
            [username]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
