import {connect} from "ts-postgres";
import {config} from "dotenv";
config();

export const HOST = process.env.DB_HOST;
export const PORT = process.env.DB_PORT;
export const USER = process.env.DB_USER;
export const PASSWORD = process.env.DB_PASSWORD;
export const DATABASE = process.env.DB_NAME;

if (!HOST || !PORT || !USER || !PASSWORD || !DATABASE) {
    throw new Error('Database connection information is not set in the environment variables');
}

export const client = await connect({
    host: HOST,
    port: parseInt(PORT),
    user: USER,
    password: PASSWORD,
    database: DATABASE,
});




