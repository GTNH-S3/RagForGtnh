import {config} from "dotenv";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {schemaKeyWord,schemaofDecompositon} from "../types/interfaces.ts";

config();
export const GEMINI_API_KEY = process.env.GEMINI_API;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const model_keyword = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Extract keywords from the provided text.',
    generationConfig: {
        responseSchema: schemaKeyWord,
        responseMimeType: 'application/json',
    }
});

export const model_test = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: ' Answer the question according to the "GT New Horizons (GTNH) is a Minecraft 1.7.10 modpack maintained and supported by dedicated community members just like you! With over 10 years in development, GTNH offers a carefully balanced and immersive experience to challenge players as they climb through the 15 tiers of technology. The ultimate goal of GTNH is to build the Stargate, an interdimensional teleporter and the symbol for absolute prestige, aptitude, and determination".'
});


export const model_queryTransformation = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Here the query is broken into sub-queries. Each sub-query is then answered using the basic RAG flow introduced at the start. Each answer is then fed into an LLM again along with the original question to synthesize the final answer. We can generate the sub-queries sequentially as shown above or all at the same time. For example, for the query 'Is the average temperature in summer in Berlin more than its average temperature in 2005' the sub-queries generated would be 'Current Average temperature in Berlin', 'Average temperature in Berlin in 2005', then using the answer of these two queries an LLM will be able to give us the final answer.
Query decomposition is important as user queries that pose analytical or logical questions may not be directly stated in the document list. For example, there may be no sentence that says 'Berlin's average temperature today is less than it was in 2005', so doing a direct vector search with the user query would yield only irrelevant documents.`,
    generationConfig: {
        responseSchema: schemaofDecompositon,
        responseMimeType: 'application/json'
    }
});
