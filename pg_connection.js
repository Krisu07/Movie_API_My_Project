import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pngPool = new pg.Pool({
    host: process.env.PG_HOSTM,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    user: process.env.PG_DB,
    password: process.env.PG_PW,
})

export {pngPool};