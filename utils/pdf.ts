import { pdfToText } from 'pdf-ts';
import { promises as fs } from 'fs';
import os from 'os';
import { bestChunk, extractKeywords } from '../ai/aiFunctions.ts';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getTitle(text: string): string {
    return text.split('\n')[1];
}

const PATH = 'C:\\Users\\firat\\Desktop\\DataScience\\RagForGtnh\\data\\Introduction';

async function processFiles() {
    const file_names = await fs.readdir(PATH);
    for (const file_name of file_names) {
        const file_path = `${PATH}\\${file_name}`;
        try {
            const pdf = await fs.readFile(file_path);
            const text = await pdfToText(pdf);
            console.log(text);

            // Uncomment and complete the following code if needed
            // const chunks = await bestChunk(text);
            // const keys = [];
            // console.log(chunks);
            //
            // let count = 0;
            // for (const chunk of chunks) {
            //     await sleep(1500);
            //     const keywords = await extractKeywords(chunk);
            //     console.log(`Chunk ${count}: ${keywords.join(', ')}`);
            //     count = count + 1;
            //     keys.push(keywords);
            // }
        } catch (error) {
            console.error(`Error processing file ${file_name}:`, error);
        }
    }
}

processFiles().catch(console.error);