import {
    extractKeywords,
    bestChunk,
    completeRagPipeline,
    extractMainSummary
} from '../ai/aiFunctions.ts';
import {processFiles} from '../utils/pdf.ts';
import {
    mainPageInsert,
    mainPageSelect,
    initializeDatabase,
    sectionsInsert,
    insertChunk,
    embeddingSectionHybrid
} from '../db/process.ts';
import {promises as fs} from "fs";
import {sleep} from "../utils/sleep.ts";
import path from 'path';
import {chatHandler} from "../events/event.ts";

// Configuration
const BASE_DATA_PATH = process.env.DATA_PATH || 'data';
const DEFAULT_SEARCH_SETTINGS = {
    CHUNK_LIMIT: 10,
    EMBEDDING_WEIGHT: 0.9,
    KEYWORD_WEIGHT: 0.1,
    CONTEXT_WINDOW: 3
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
    console.log(`Testing question: "${question}"`);

    try {
        const finalResult = await completeRagPipeline(
            question,
            embeddingSectionHybrid(question, settings)
        );

        console.log(`Answer: ${finalResult}`);
        return finalResult;
    } catch (error : any) {
        console.error(`Error testing question: ${error}`);
        return `Error: ${error.message}`;
    }
}

/**
 * Batch test multiple questions
 * @param questions Array of questions to test
 */
async function batchTestQuestions(questions: string[]): Promise<{question: string, answer: string}[]> {
    const results = [];

    for (const question of questions) {
        const answer = await Question(question);
        results.push({ question, answer });
    }

    return results;
}

/**
 * Compare different search settings
 * @param question Question to test
 * @param settingsArray Array of different settings to compare
 */
async function compareSearchSettings(
    question: string,
    settingsArray: Array<{name: string, settings: typeof DEFAULT_SEARCH_SETTINGS}>
): Promise<{settingName: string, answer: string}[]> {
    const results = [];

    for (const {name, settings} of settingsArray) {
        console.log(`Testing with settings: ${name}`);
        const answer = await Question(question, settings);
        results.push({ settingName: name, answer });
    }

    return results;
}

// Example usage functions - uncomment as needed

// Process multiple sections
async function processSections(sectionNames: string[]): Promise<void> {
    for (const section of sectionNames) {
        await createSectionSummary(section);
        await processDirectory(section);
    }
}

// Main execution
async function TryQuestion(text: string = 'What is the best way to get steel in GTNH?') {
    // Uncomment the function you want to use

    // Example 1: Process sections
    // await processSections(['LV', 'MV', 'HV']);

    // Example 2: Test a single question
    // await Question(text);

    // Example 3: Batch test multiple questions
    // const questions = [
    //     'How do I progress to LV tier?',
    //     'What is the best way to get steel in GTNH?',
    //     'How do I automate ore processing?'
    // ];
    // const results = await batchTestQuestions(questions);
    // console.table(results);

    // Example 4: Compare different search settings
    // const settingsToCompare = [
    //     {
    //         name: 'Balanced',
    //         settings: { CHUNK_LIMIT: 5, EMBEDDING_WEIGHT: 0.6, KEYWORD_WEIGHT: 0.4, CONTEXT_WINDOW: 2 }
    //     },
    //     {
    //         name: 'Embedding Focus',
    //         settings: { CHUNK_LIMIT: 5, EMBEDDING_WEIGHT: 0.9, KEYWORD_WEIGHT: 0.1, CONTEXT_WINDOW: 2 }
    //     },
    //     {
    //         name: 'Keyword Focus',
    //         settings: { CHUNK_LIMIT: 5, EMBEDDING_WEIGHT: 0.3, KEYWORD_WEIGHT: 0.7, CONTEXT_WINDOW: 2 }
    //     }
    // ];
    // const comparisonResults = await compareSearchSettings('How do I automate ore processing?', settingsToCompare);
    // console.table(comparisonResults);
}


async function startEvent() {
    console.log('Starting event...');
    chatHandler.start();

}

// Run the event
//await startEvent();

// Run the main function
//await TryQuestion("How do I store my itemss");


// Uncomment to process a specific directory


