import express, { response } from 'express';
import { pgPool } from './pg_connection.js';

const app = express();

app.listen(3002, ()=>{
    console.log('Server is running');
});

app.get('/users', async (req,res) => {

    try {
        const result= await pgPool.query('SELECT * FROM "users"');
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});

app.get('/movies', async (req,res) => {

    try {
        const result= await pgPool.query('SELECT * FROM "movies"');
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});
app.get('/genres', async (req,res) => {

    try {
        const result= await pgPool.query('SELECT * FROM "genres"');
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});