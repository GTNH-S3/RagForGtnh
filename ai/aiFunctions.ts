import {model_best_chunk, model_keyword, model_mainTitle, model_queryTransformation, model_test} from "./models.ts";
import type {GenerateContentResult} from "@google/generative-ai";


/**
 * Extracts keywords from the provided text.
 * @param text The text from which to extract keywords.
 * @returns The extracted keywords.
 */

export async function extractKeywords(text: { chunk: string; title: string }): Promise<string[]> {

    const result = await model_keyword.generateContent(text.chunk);
    const response = result.response.text()
    return JSON.parse(response).map((item: { keyword: string }) => item.keyword);
}


/**
 * Extracts keywords from the provided text.
 * @param  text The give result according to context.
 * @returns The answer.
 */

export async function testModel(text: string): Promise<string> {
    const result = await model_test.generateContent(text);
    return result.response.text();
}


/**
 * Decomposes the query into sub-queries and answers them.
 * @param text The query to decompose.
 * @returns The decomposed sub-queries and their answers.
 */

export async function queryTransformation (text: string): Promise<string> {
    const result = await model_queryTransformation.generateContent(text);
    return JSON.parse(result.response.text()).map((item: { subQuery: string }) => item.subQuery).join('\n');
}


/**
 * Best chunks the provided text into smaller parts.
 * @param text The text to chunk.
 * @returns The best-chunked parts and their titles.
 *
 */
export async function bestChunk(text: string): Promise<{ chunk: string, title: string }[]> {
    const result = await model_best_chunk.generateContent(text);
    return JSON.parse(result.response.text()).map((item: { chunk: string, title: string }) => ({
        chunk: item.chunk,
        title: item.title
    }));
}

/**
 * Extracts main Title from the provided text.
 * @param text The text to chunk.
 * @returns The best-chunked parts and their titles.
 *
 */

export function extractMainTitle(text: string): Promise<GenerateContentResult> {
    return model_mainTitle.generateContent(text);
}

