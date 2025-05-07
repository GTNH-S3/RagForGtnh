import {model_answer_synthesis, model_best_chunk, model_keyword, model_mainSummery, model_queryTransformation, model_test} from "./models.ts";

/**
 * Extracts technical keywords from the provided GTNH-related content.
 * Focuses on extracting mod names, machines, items, and game mechanics.
 *
 * @param text Object containing chunk content and related title
 * @returns Promise<string[]> Array of extracted keywords
 */
export async function extractKeywords(text: { chunk_content: string; title: string }): Promise<string[]> {
    try {
        const result = await model_keyword.generateContent(text.chunk_content);
        const response = result.response.text();
        return JSON.parse(response).map((item: { keyword: string }) => item.keyword);
    } catch (error) {
        console.error('Error extracting keywords:', error);
        return []; // Return empty array as fallback
    }
}


/**
 * Decomposes complex queries into multiple semantically varied sub-queries
 * to improve RAG retrieval effectiveness.
 *
 * @param text User's original query about GTNH
 * @returns Promise<{originalQuery: string, isComplex: boolean, subQueries: string[]}>
 */
export async function queryTransformation(text: string): Promise<{originalQuery: string, subQueries: string[]
}> {
    try {
        const result = await model_queryTransformation.generateContent(text);
        const parsed = JSON.parse(result.response.text());

        const queries = []
        for  (const query of parsed) {
            queries.push(query['subQuery']);
        }

        return {
            originalQuery: parsed.originalQuery || text,
            subQueries: queries
        };
    } catch (error) {
        console.error('Error transforming query:', error);
        // Fallback to original query if transformation fails
        return {
            originalQuery: text,
            subQueries: [text]
        };
    }
}

/**
 * Creates optimal semantic chunks from input text
 * @param text Input text to be chunked
 * @returns Array of text chunks
 */
export async function bestChunk(text: string): Promise<{chunk: string}[]> {
    // For very large texts, break into smaller sections first
    if (text.length > 25000) {
        console.log("Text too large, breaking into sections first");
        return processLargeText(text);
    }

    try {
        // Send to model and get response
        const result = await model_best_chunk.generateContent(text);

        // Check if we have a valid response
        if (!result || !result.response) {
            console.error("Invalid response from model");
            return fallbackChunking(text);
        }

        // Get the text response
        const responseText = result.response.text();

        try {
            // Attempt to parse the JSON response
            const chunks = JSON.parse(responseText);

            // Validate chunks format
            if (!Array.isArray(chunks)) {
                console.error("Response is not an array:", chunks);
                return fallbackChunking(text);
            }

            if (chunks.length > 0 && chunks.every(chunk => chunk.chunk && typeof chunk.chunk === 'string')) {
                return chunks;
            } else {
                console.error("Chunks don't follow expected format");
                return fallbackChunking(text);
            }
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            return fallbackChunking(text);
        }
    } catch (modelError) {
        console.error("Error from model:", modelError);
        return fallbackChunking(text);
    }
}

/**
 * Process large text by breaking it into sections first
 * @param text Large text to process
 * @returns Combined chunks from all sections
 */
async function processLargeText(text: string): Promise<{ chunk: string }[]> {
    // Break text into sections of ~10000 characters at paragraph boundaries
    const sections: string[] = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
        let sectionEnd = Math.min(currentPosition + 10000, text.length);

        // Find a paragraph break if possible
        if (sectionEnd < text.length) {
            const nextParagraph = text.indexOf('\n\n', sectionEnd - 500);
            if (nextParagraph !== -1 && nextParagraph < sectionEnd + 500) {
                sectionEnd = nextParagraph + 2;
            }
        }

        sections.push(text.substring(currentPosition, sectionEnd));
        currentPosition = sectionEnd;
    }

    // Process each section and combine results
    const results = await Promise.all(sections.map(section => {
        return bestChunk(section).catch(() => fallbackChunking(section));
    }));
    return results.flat();
}

/**
 * Simple fallback chunking algorithm when AI chunking fails
 * @param text Text to chunk
 * @returns Array of chunks
 */
function fallbackChunking(text: string): {chunk: string}[] {
    console.log("Using fallback chunking method");
    const chunks: {chunk: string}[] = [];
    const targetSize = 400;

    // Simple paragraph-based chunking
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length + 1 <= targetSize || currentChunk.length === 0) {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        } else {
            chunks.push({ chunk: currentChunk });
            currentChunk = paragraph;
        }
    }

    if (currentChunk) {
        chunks.push({ chunk: currentChunk });
    }

    return chunks;
}
/**
 * Extracts a comprehensive technical summary from GTNH content.
 * Focuses on preserving technical details and key progression information.
 *
 * @param text GTNH-related document to summarize
 * @returns Promise<{sum: string}> Object containing the summary
 */
export async function extractMainSummary(text: string): Promise<{sum: string}> {
    try {
        const result = await model_mainSummery.generateContent(text);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error('Error extracting summary:', error);
        return { sum: "Failed to generate summary." };
    }
}

/**
 * Synthesizes a comprehensive answer from multiple context chunks based on relevance scores.
 * Prioritizes higher-scored chunks and maintains GTNH technical accuracy.
 *
 * @param originalQuestion User's original GTNH question
 * @param retrievedChunks Array of chunks with their relevance scores and page sources
 * @returns Promise<string> Synthesized comprehensive answer
 */
export async function synthesizeAnswer(originalQuestion: string, retrievedChunks: string[]): Promise<string> {

    const text = retrievedChunks.join('\n');
    const textF = "*******************QUESTİON" + originalQuestion + "QUESTİON*******************\n\**** \n" +
        "\n" +
        "Do not use more than 250 characters including spaces.*" +
        "\n" +
        + text;

    try {


        const result = await model_answer_synthesis.generateContent(textF);
        return result.response.text();
    } catch (error) {
        console.error('Error synthesizing answer:', error);
        return "Sorry, I encountered an error while generating your answer. Please try again with a different question.";
    }
}

/**
 * Performs a complete RAG pipeline: transforms query, retrieves relevant chunks,
 * and synthesizes a comprehensive answer.
 *
 * @param query User's original question about GTNH
 * @param embeddingPromise Promise with retrieval results
 * @returns Promise<string> Final synthesized answer
 */
export async function completeRagPipeline(
    query: string,
    embeddingPromise: Promise<{ allResults: any[][]; queries: string[] }>
): Promise<string> {
    try {



        // Step 2: Retrieve relevant chunks (already in progress via the promise)
        const {allResults} = await embeddingPromise;
        const uniqueResults: any[] = [];

// The structure appears to be three levels deep
        allResults.forEach((chunks: any) => {
            chunks.forEach((chunk: any) => {
                uniqueResults.push(chunk[1]);
            });
        });

        console.log("Total Chunks Retrieved: ", uniqueResults.length);
        return await synthesizeAnswer(query,uniqueResults);
    } catch (error) {
        console.error('Error in RAG pipeline:', error);
        return "I encountered an error processing your question about GT New Horizons. Please try rephrasing your question.";
    }
}