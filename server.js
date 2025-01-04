import express, { response } from 'express';
import { pgPool } from './pg_connection.js';

const app = express();

//serverin starttaus
app.listen(3003, () => {
    console.log('Server is running on in port 3003');
});


