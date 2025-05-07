/**
 * Scrapes data from the Wikipedia page of the GTNH modpack
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import {mainPageInsert} from "../db/process.ts";
import type {Section} from "../types/interfaces.ts";


const LINK = "https://wiki.gtnewhorizons.com/wiki/Main_Page";
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
};

/**
 * Scrapes the main page of the GTNH wiki.
 * @returns {Promise<Section[]>} - An array of sections with their titles and links.
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

/**
 * Retrieves titles and paragraphs from a given link.
 * @param {string} link - The URL to scrape.
 * @returns {Promise<{ titles: string[], paragraphs: string[] }>} - Object containing titles and paragraphs.
 */
async function introduction(link: string): Promise<{ titles: string[], paragraphs: string[] }> {
  const response = await axios.get(link, { headers });
  const $ = cheerio.load(response.data);

  const titles = $('h1, h2, h3').map((i, element) => $(element).text()).get();
  const paragraphs = $('p,h1, h2, h3').map((i, element) => $(element).text()).get();

  return { titles, paragraphs };
}

const selection = mainPage();
selection.then(data => {
  data.forEach((item) => {
    item.links.forEach((link) => {
      console.log(link.title);
      mainPageInsert(link.title, link.href, item.title)
        .then(() => {
          console.log('Inserted');
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});