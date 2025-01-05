import express from 'express';
import { pgPool } from './pg_connection.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// uuden genren lisäys
app.post('/genres', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pgPool.query('INSERT INTO genres (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// uuden elokuvan lisäys
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

// 3. uuden käyttäjän rekistöröityminen
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

// 4. hae elokuva id:n avulla
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

// 5. poista elokuva id:n avulla
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

// 6. saa vain 10 elokuvaa sivulle
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

// 7. hae elokuva avain sanalla
app.get('/movies/search', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        return res.status(400).json({ error: 'Keyword must be a non-empty string' });
    }

    const trimmedKeyword = keyword.trim();

    try {
        const query = `
            SELECT movies.*
            FROM movies
            LEFT JOIN genres ON movies.genre_id = genres.genre_id
            WHERE movies.searchkeyword ILIKE $1
            OR movies.name ILIKE $1
            OR movies.year::text ILIKE $1
            OR genres.name ILIKE $1;
        `;

        const result = await pgPool.query(query, [`%${trimmedKeyword}%`]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No movies found for the given keyword' });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error.message);
        res.status(500).json({ error: error.message });
    }
});
// 8. lisää elokuva review
app.post('/reviews', async (req, res) => {
    const { userid, stars, reviewtext, movieid } = req.body;
    
    if (!userid || !stars || !movieid) {
        return res.status(400).json({ error: "User ID, stars, and movie ID are required" });
    }
    
    try {
        const result = await pgPool.query(
            'INSERT INTO reviews (userid, stars, reviewtext, movieid) VALUES ($1, $2, $3, $4) RETURNING *',
            [userid, stars, reviewtext, movieid]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 9. lisää suosikki elokuvia
app.post('/favorites', async (req, res) => {
    const { userid, movieid } = req.body;
    try {
        const result = await pgPool.query(
            'INSERT INTO favorites (userid, movieid) VALUES ($1, $2) RETURNING *',
            [userid, movieid]
        );
        res.status(201).json(result.rows[0]); // Return the new favorite movie
    } catch (error) {
        console.error('Error adding favorite movie:', error);
        res.status(400).json({ error: error.message });
    }
});

// 10. Hae elokuva käyttäjänimen avulla
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

//error prevent code
process.on('uncaughtException', (err) => {
    console.error("Uncaught Exception:", err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
