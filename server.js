import express from 'express';
import { pgPool } from './pg_connection.js';

const app = express();
app.use(express.json());

app.listen(3003, () => {
    console.log('Server is running on in port 3003');
});


