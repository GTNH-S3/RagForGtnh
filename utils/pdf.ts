import {pdfToText} from 'pdf-ts';
import {promises as fs} from 'fs';
import path from "path";

/***
    *  This function sleeps for the given milliseconds.
    * @param ms
    * @returns
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/***
    *  This function returns the title of the text.
    * @param text
    * @returns
 */

export function getTitle(text: string): string {
    return text.split('\n')[1];
}




/**
 * Processes a PDF file or all PDF files in a directory.
 * If the input is a full path, it processes that file.
 * If the input is a directory name, it processes all PDF files in that directory.
 * @param input The path to the PDF file or the directory name.
 * @returns An array of text chunks extracted from the PDF files.
 */

export async function processFiles(input: string): Promise<string[]> {
    const BASE_DATA_PATH = 'C:\\Users\\firat\\Desktop\\DataScience\\RagForGtnh\\data';

    // Check if input is already a full path
    const isFullPath = input.includes(':\\') || input.startsWith('/');

    if (isFullPath) {
        // Input is already a full path - use it directly
        const pdf = await fs.readFile(input);
        const text = await pdfToText(pdf);

        // Split text if it exceeds 30,000 characters
        return splitTextIfNeeded(text, 30000);
    } else {
        // Input is a directory name or relative path
        const dirPath = path.join(BASE_DATA_PATH, input);
        const file_names = await fs.readdir(dirPath);
        const texts: string[] = [];

        for (const file_name of file_names) {
            const file_path = path.join(dirPath, file_name);
            try {
                const pdf = await fs.readFile(file_path);
                const text = await pdfToText(pdf);

                // Split text if it exceeds 30,000 characters
                texts.push(...splitTextIfNeeded(text, 30000));
            } catch (error) {
                console.error(`Error processing file ${file_name}:`, error);
            }
        }
        return texts;
    }
}

/**
 * Splits text into chunks if it exceeds the specified character limit.
 * @param text The input text to split.
 * @param limit The character limit for each chunk.
 * @returns An array of text chunks.
 */
function splitTextIfNeeded(text: string, limit: number): string[] {
    if (text.length <= limit) {
        return [text];
    }

    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += limit) {
        chunks.push(text.slice(i, i + limit));
    }
    return chunks;
}
