/**
 * This file is for scraping data from the Wikipedia page of the GTNH modpack.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const LINK = "https://wiki.gtnewhorizons.com/wiki/Main_Page"; // Link to GTNH wiki
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
};

/**
 * Data Structure
 *
 * {
 *    "id": id, // Unique id of the article
 *    "title": title, // Title of the article (PostgreSQL with pgvector)
 *    "content": content, // Content of the article
 *    "summary": summary, // Summary of the article
 *    "Vectors": { "vector1": value, "vector2": value, ...} // Vectors are the features of the article
 *    "Tags": [tag1, tag2, ...] // Tags are the labels of the article
 *    "Source": source, // Source is the link of the article
 *    "TIMESTAMP": timestamp // Time when the article was scraped
 * }
 */

async function getData(): Promise<string[]> {
    try {
        const response = await axios.get(LINK, { headers });
        const $ = cheerio.load(response.data);
        const links: string[] = [];
        $('a[href]').each((index, element) => {
            links.push($(element).attr('href') as string);
        });
        return links;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

getData().then(links => console.log(links));