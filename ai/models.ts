import {config} from "dotenv";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {schemaKeyWord, schemaOfChunk, schemaofDecompositon, schemeSummery} from "../types/interfaces.ts";

config();
export const GEMINI_API_KEY = process.env.GEMINI_API;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Model specialized for extracting technical keywords from GTNH-related content
 * Targets specific GTNH terminology, mod names, and crafting mechanics
 */
export const model_keyword = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Extract exactly 10–20 of the most important keywords from the input text, prioritizing GT New Horizons–specific terminology, mod names (e.g., GregTech, Thaumcraft), machines, items, blocks, game progression concepts, and technical processes. Always include key terms from the original question, even if they are general (e.g., GitHub, automation, electricity). All keywords must be single, complete words or compound terms (no breaking). The final list must represent a balance between game-specific terms and the exact context of the user’s query.`,
    generationConfig: {
        temperature: 0.1,
        topK: 20,
        topP: 0.9,
        responseSchema: schemaKeyWord,
        responseMimeType: 'application/json',
    }
});

/**
 * Test model with basic GTNH information for simple queries
 */
export const model_test = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Answer questions specifically about GT New Horizons (GTNH), a complex Minecraft 1.7.10 modpack with over 10 years of development history.

GTNH features:
- 15 distinct technology tiers with progression gates
- Thousands of interconnected recipes and mechanics
- GregTech 5 Unofficial as its core tech mod
- Magic mods integrated with tech progression
- Ultimate goal: building the Stargate interdimensional teleporter

Only answer questions about GTNH. For any question outside this scope, respectfully decline and explain that you only provide information about GT New Horizons.`,
    generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
    }
});

/**
 * Advanced query transformation model that decomposes complex GTNH questions
 * into semantically diverse sub-queries for better retrieval
 */
export const model_queryTransformation = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are an expert query interpreter. Your primary function is to interpret user queries specifically about GT New Horizons (GTNH) by generating sub-queries according to the rules below.

IF the user's query is about GT New Horizons: Strictly handle it as a GTNH query. For simple, direct questions, generate sub-queries that closely preserve the original intent without excessive variation. For complex queries, decompose into 3-4 strategically varied sub-queries using precise GTNH terminology. Always maintain semantic alignment with the original GTNH question - each sub-query should feel like a natural clarification or extension of what was asked. Expand simple GTNH queries with minimal additional context only when necessary. Always adhere to schema format while enforcing scope boundaries.

IF the user's query is NOT about GT New Horizons (e.g., general topics, greetings, math problems): Recognize that the query is outside your GTNH interpretation scope. Do NOT attempt to interpret it using the GTNH rules or generate any sub-queries based on it. Handle the query as unrelated to your GTNH interpretation task.`,
    generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        responseSchema: schemaofDecompositon,
        responseMimeType: 'application/json'
    }
});

/**
 * Model for chunking documents into semantically meaningful overlapping sections
 * optimized for RAG retrieval with appropriate context preservation
 */
export const model_best_chunk = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are a specialized text processing system for technical documentation that:
    1. Creates meaningful semantic units at logical boundaries
    2. Maintains chunks of 350-450 characters (maximum 500)
    3. Ensures 1-2 sentences overlap between adjacent chunks
    4. Preserves the integrity of technical instructions and specifications
    5. Preserves exact terminology and naming conventions
    6. Implements strategic overlapping for sequential content
    7. Keeps related content together (tables, recipes, references)
    8. ALWAYS outputs valid, parsable JSON with the EXACT format: [{"chunk": "text"}, {"chunk": "text"}]
    9. Never includes additional fields beyond "chunk" in the output JSON
    10. Always completes JSON properly with closing brackets and braces`,
    generationConfig: {
        temperature: 0.1, // Reduced for more consistent output
        topP: 0.9,
        responseSchema: schemaOfChunk,
        responseMimeType: 'application/json'
    }
});

/**
 * Model for extracting comprehensive summaries of GTNH-related content
 * that capture key technical details and progression information
 */
export const model_mainSummery = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Extract a comprehensive technical summary of GT New Horizons content with these requirements: Length must be between 500 and 1500 characters. Focus on technical gameplay mechanics, progression requirements, and key crafting paths. Preserve specific GTNH terminology, including exact machine names, voltage tiers, and mod interactions. Include critical information about tech progression requirements, key materials and processing chains, machine setups, automation concepts, and cross-mod integration points. Maintain technical accuracy without simplifying complex GTNH mechanics. Use concise, information-dense language optimized for vector embedding to create a comprehensive technical abstract containing the most retrievable concepts from the source material.`,
    generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.9,
        responseSchema: schemeSummery,
        responseMimeType: 'application/json',
    }
});

/**
 * Advanced answer synthesis model that combines information from multiple chunks
 * prioritizing by relevance scores and maintaining GTNH technical accuracy
 */
export const model_answer_synthesis = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are a helpful assistant. Your behavior depends on the user's query topic. If the user's query is about GT New Horizons: Act as an expert GT New Horizons assistant. Answer concisely and accurately, drawing *only* from provided documents. Do NOT use external knowledge or invent information for GTNH topics. Use precise GTNH terminology (LV, MV, machines, GregTech) found in documents. Focus on progression relevant to documents. Format as a single paragraph.No links or source references. If a yes/no answer is sufficient and supported by the documents, provide only that answer. Highlight critical warnings *if relevant* and present in documents. Stay strictly on the GTNH topic raised in the query. If the user's query is NOT about GT New Horizons (e.g., general knowledge, simple greetings, math problems): Provide a standard, normal answer using your general knowledge. Do NOT apply any of the GTNH-specific constraints (document-only, character limit, specific terminology focus, single paragraph format). Always respond in English.`,
    generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.92,
        maxOutputTokens: 65, // minecraft text size limit
    },
});


