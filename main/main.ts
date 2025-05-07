import {bestChunk, completeRagPipeline, extractKeywords, extractMainSummary} from '../ai/aiFunctions.ts';
import {processFiles} from '../utils/pdf.ts';
import {embeddingSectionHybrid, insertChunk, sectionsInsert} from '../db/process.ts';
import {promises as fs} from "fs";
import path from 'path';
import {chatHandler} from "../events/event.ts";

// Configuration
const BASE_DATA_PATH = process.env.DATA_PATH || 'data';
const DEFAULT_SEARCH_SETTINGS = {
    CHUNK_LIMIT: 20,
    EMBEDDING_WEIGHT: 0.9,
    KEYWORD_WEIGHT: 0.1,
    CONTEXT_WINDOW: 4
};

/**
 * Process a single document and create chunks
 * @param filePath Path to the document
 * @param sectionName Section name for database
 * @param fileName Name of the file
 */
export async function processDocument(filePath: string, sectionName: string, fileName: string): Promise<void> {
    console.log(`Processing document: ${fileName}`);
    try {
        const text = await processFiles(filePath);
        console.log(`Content loaded for: ${fileName}`);
        const chunks = await bestChunk(text[0]);
        console.log(`Generated ${chunks.length} chunks for: ${fileName}`);

        for (const chunk of chunks) {
            await insertChunk(chunk.chunk, sectionName, fileName);
        }
        console.log(`Successfully processed ${fileName}`);
    } catch (error) {
        console.error(`Error processing document ${fileName}:`, error);
    }
}

/**
 * Process all documents in a directory
 * @param directoryName Directory containing documents
 */
export async function processDirectory(directoryName: string): Promise<void> {
    const dirPath = path.join(BASE_DATA_PATH, directoryName);
    console.log(`Processing directory: ${directoryName}`);

    try {
        const fileNames = await fs.readdir(dirPath);

        for (const fileName of fileNames) {
            const fullPath = path.join(dirPath, fileName);
            await processDocument(fullPath, directoryName, fileName);
        }
        console.log(`Completed processing directory: ${directoryName}`);
    } catch (error) {
        console.error(`Error processing directory ${directoryName}:`, error);
    }
}

/**
 * Create section summary and keywords
 * @param directoryName Directory name/section name
 */
export async function createSectionSummary(directoryName: string): Promise<void> {
    try {
        console.log(`Creating summary for section: ${directoryName}`);
        const text = await processFiles(directoryName);
        const allText = text.join(' ');

        const summary = await extractMainSummary(allText);
        const keywords = await extractKeywords({chunk_content: summary.sum, title: directoryName});

        await sectionsInsert(directoryName, keywords, summary.sum);
        console.log(`Section summary created for: ${directoryName}`);
    } catch (error) {
        console.error(`Error creating summary for ${directoryName}:`, error);
    }
}

/**
 * Test RAG pipeline with a specific question
 * @param question Question to test
 * @param settings Optional search settings
 */
export async function Question(question: string, settings = DEFAULT_SEARCH_SETTINGS): Promise<string> {

    try {
        return await completeRagPipeline(
            question,
            embeddingSectionHybrid(question, settings)
        );

    } catch (error : any) {
        console.error(`Error testing question: ${error}`);
        return `Error: ${error.message}`;
    }
}



// Process multiple sections
async function processSections(sectionNames: string[]): Promise<void> {
    for (const section of sectionNames) {
        await createSectionSummary(section);
        await processDirectory(section);
    }
}

// Main execution
async function TryQuestion(text: string = 'What is the best way to get steel in GTNH?') {
    console.log(`Testing question: ${text}`);
    const result = await Question(text);
    console.log(`Result: ${result}`);
    return result;
}


async function startEvent() {
    console.log('Starting event...');
    chatHandler.start();

}








