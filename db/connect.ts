import { SQL } from "bun";
import { config } from "dotenv";
config();

export const HOST = process.env.DB_HOST
export const PORT = process.env.DB_PORT
export const USER = process.env.DB_USER
export const PASSWORD = process.env.DB_PASSWORD
export const DATABASE = process.env.DB_NAME
export const URL = process.env.DB_URL

let db;
try {
    // @ts-ignore
    db = new SQL({
        url: URL,
        host: HOST,
        port: Number(PORT),
        database: DATABASE,
        username: USER,
        password: PASSWORD,
        maxLifetime: 0,
        connectionTimeout: 10,
        adapter: 'postgres',
        bigint: false,
    });
    console.log('Connected to the database');
} catch (e) {
    console.error('Error connecting to the database');
    console.error(e);
}

export { db };