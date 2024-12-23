import express, { response } from 'express';
import { pgPool } from './pg_connection.js';

const app = express();

app.listen(3001, ()=>{
    console.log('Server is running');
});

app.get('/User', async (req,res) => {

    try {
        const result= await pgPool.query('SELECT * FROM "User"');
        res.json(result.rows);
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});