import {config} from 'dotenv';
import {GoogleGenerativeAI, SchemaType} from "@google/generative-ai";
import {schema} from '../types/interfaces';

config();
export const GEMINI_API_KEY = process.env.GEMINI_API;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model_keyword = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Extract keywords from the provided text.',
    generationConfig: {
        responseSchema: schema,
        responseMimeType: 'application/json',
    }
});

const model_test = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: ' Answer the question according to the "GT New Horizons (GTNH) is a Minecraft 1.7.10 modpack maintained and supported by dedicated community members just like you! With over 10 years in development, GTNH offers a carefully balanced and immersive experience to challenge players as they climb through the 15 tiers of technology. The ultimate goal of GTNH is to build the Stargate, an interdimensional teleporter and the symbol for absolute prestige, aptitude, and determination".'
});

/**
 * Extracts keywords from the provided text.
 * @param text The text from which to extract keywords.
 * @returns The extracted keywords.
 */

export async function extractKeywords(text: string): Promise<string[]> {

    const result = await model_keyword.generateContent(text);
    const response = result.response.text()
    return JSON.parse(response).map((item: { keyword: string }) => item.keyword);
}


/**
 * Extracts keywords from the provided text.
 * @param text The text from which to extract keywords.
 * @returns The extracted keywords.
 */

export async function testModel(text: string): Promise<string> {
    const result = await model_test.generateContent(text);
    return result.response.text();
}