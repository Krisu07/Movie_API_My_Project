import express, { response } from 'express';
import { pgPool } from './pg_connection.js';

const app = express();

//serverin starttaus
app.listen(3003, () => {
    console.log('Server is running on in port 3003');
});

//lisätään uusi genre 
app.post('/genres', async (require, response) =>{
    const {name} = require.body;
    try{
        const result = await pgPool.query('INSERT INTO genres (name) VALUES (1$) RETURNING*',[name]);
        response.status(201).json(result.rows[0]);        
    } catch (error){
        response.status(400).json({error: error.message});
    }
})


