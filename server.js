import express from 'express';
import { pgPool } from './pg_connection.js';

const app = express();

app.use(express.json());

app.listen(3004, () => {
    console.log('Server is running on http://localhost:3004');
});

app.post('/genres', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Genre name is required' });
    }

    try {
        const result = await pgPool.query(
            'INSERT INTO "genres" (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json({ message: 'Genre added successfully', genre: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/movies', async (req, res) => {
    const { name, year, genre } = req.body;
    if (!name || !year || !genre) {
        return res.status(400).json({ error: 'Movie name, year, and genre are required' });
    }

    try {
        const result = await pgPool.query(
            'INSERT INTO "movies" (name, year, genre) VALUES ($1, $2, $3) RETURNING *',
            [name, year, genre]
        );
        res.status(201).json({ message: 'Movie added successfully', movie: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users', async (req, res) => {
    const { name, username, password, yearOfBirth } = req.body;
    if (!name || !username || !password || !yearOfBirth) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pgPool.query(
            'INSERT INTO "users" (name, username, password, year_of_birth) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, username, password, yearOfBirth]
        );
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/movies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pgPool.query('SELECT * FROM "movies" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pgPool.query('DELETE FROM "movies" WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie removed successfully', movie: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/movies', async (req, res) => {
    const { page = 1 } = req.query; // Default to page 1
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const result = await pgPool.query('SELECT * FROM "movies" LIMIT $1 OFFSET $2', [limit, offset]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/movies/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        const result = await pgPool.query(
            'SELECT * FROM "movies" WHERE LOWER(name) LIKE LOWER($1)',
            [`%${keyword}%`]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/reviews', async (req, res) => {
    const { username, stars, reviewText, movieId } = req.body;
    if (!username || !stars || !reviewText || !movieId) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pgPool.query(
            'INSERT INTO "reviews" (username, stars, review_text, movie_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, stars, reviewText, movieId]
        );
        res.status(201).json({ message: 'Review added successfully', review: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/favorites', async (req, res) => {
    const { username, movieId } = req.body;
    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movie ID are required' });
    }

    try {
        const result = await pgPool.query(
            'INSERT INTO "favorites" (username, movie_id) VALUES ($1, $2) RETURNING *',
            [username, movieId]
        );
        res.status(201).json({ message: 'Favorite movie added successfully', favorite: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/favorites/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pgPool.query(
            'SELECT m.* FROM "favorites" f JOIN "movies" m ON f.movie_id = m.id WHERE f.username = $1',
            [username]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
