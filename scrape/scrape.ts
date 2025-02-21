/**
 * This file is for scraping data from the Wikipedia page of the GTNH modpack.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type {Section} from '../types/interfaces';
import {mainPageInsert} from '../db/process';

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


/**
 * This function scrapes the main page of the GTNH wiki.
 * @returns {Section[]} - An array of sections with their titles and links.
 * @throws {Error} - If the request fails.
 */

async function mainPage(): Promise<Section[]> {
    const response = await axios.get(LINK, { headers });
    const $ = cheerio.load(response.data);
    const mainGtnh = $('td[colspan="2"][rowspan="2"]').text();
    console.log(mainGtnh);
    const sections: Section[] = [];

    $('table.wikitable').each((index, table) => {
        const title = $(table).find('tr:first-child td:first-child b').text().trim();
        const links: { href: string; title: string }[] = [];

        $(table).find('tr:nth-child(2) a').each((i, link) => {
            links.push({
                href: $(link).attr('href') as string,
                title: $(link).attr('title') as string
            });
        });

        $(table).find('td:nth-child(2) a').each((i, link) => {
            links.push({
                href: $(link).attr('href') as string,
                title: $(link).attr('title') as string
            });
        });

        sections.push({ title, links });
    });

    return sections;
}

async function introduction(link: string): Promise<{ titles: string[], paragraphs: string[] }> {
    const response = await axios.get(link, { headers });
    const $ = cheerio.load(response.data);

    const titles = $('h1, h2, h3').map((i, element) => $(element).text()).get();

    const paragraphs = $('p,h1, h2, h3').map((i, element) => $(element).text()).get();



    return { titles, paragraphs };
}









// Inserting the data into the database
// const selection = mainPage();
// selection.then(data => {
//     data.forEach((item) => {
//         item.links.forEach((link) => {
//             console.log(link.title);
//             mainPageInsert(link.title, link.href, item.title  // Inserting the data into the database
//             ).then(() => {
//                 console.log('Inserted');
//             }).catch((err) => {
//                 console.log(err);
//             });
//         });
//     });
// });


// Testing the introduction function

const link = "https://wiki.gtnewhorizons.com/wiki/Low_End_PCs";

const { titles, paragraphs } = await introduction(link);

const data = { titles, paragraphs };

const sectionsForDb = [];
let currentSection = null;

for (const item of data.paragraphs) {
    if (data.titles.includes(item)) { // Check if the item is in titles array, meaning it's a title
        if (currentSection) { // If we already have a section, push it to the sections array
            sectionsForDb.push(currentSection);
        }
        currentSection = { // Start a new section with the new title
            title: item,
            paragraph_text: "" // Initialize paragraph text as empty, paragraphs will be appended
        };
    } else if (currentSection) { // If it's not a title and we have a current section, it's a paragraph
        currentSection.paragraph_text += item + "\n\n"; // Append paragraph, add double newline for separation
    }
    // Handle initial paragraphs before the first heading "Contents" and "Low End PCs" as introduction
    if (!currentSection && sectionsForDb.length === 0) {
        if (!sectionsForDb[0]) {
            sectionsForDb.push({ title: "Introduction", paragraph_text: "" });
        }
        sectionsForDb[0].paragraph_text += item + "\n\n";
    }
}

if (currentSection) { // Push the last section after loop finishes
    sectionsForDb.push(currentSection);
}


// Remove "Contents" and "Low End PCs"  sections if they exist as the first section
if (sectionsForDb.length > 0 && (sectionsForDb[0].title === "Contents" || sectionsForDb[0].title === "Low End PCs")) {
    sectionsForDb.shift(); // Remove the first element if it's "Contents" or "Low End PCs"
}

console.log(JSON.stringify(sectionsForDb, null, 2));