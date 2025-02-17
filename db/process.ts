import {client} from "./connect.ts";



export async function mainPageInsert(title: string, href: string, subtitle: string): Promise<void> {
    await client.query(`
        CREATE TABLE IF NOT EXISTS main_page
        (
            id        SERIAL PRIMARY KEY,
            title     TEXT,
            href      TEXT,
            subtitle  TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await client.query(`
    INSERT INTO main_page (title, href, subtitle) VALUES ($1, $2, $3) RETURNING *;
    `, [title, href, subtitle]);
}

export async function mainPageSelect(): Promise<void> {
    const result = await client.query(`
        SELECT * FROM main_page;
    `);
    console.log(result.rows);
}

