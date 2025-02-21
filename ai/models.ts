import {config} from "dotenv";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {schemaKeyWord, schemaofChunk, schemaofDecompositon, schemaofTitle} from "../types/interfaces.ts";

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

export const model_best_chunk = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Given a text, best chunk it into smaller parts of a maximum size of 500 characters. 
You are an expert document chunking assistant. Your goal is to divide the given text into smaller, semantically coherent chunks suitable for a Retrieval-Augmented Generation (RAG) system.  Follow these instructions carefully to produce the best possible chunking in JSON format as defined by the provided schema.

**Chunking Principles:**

1.  **Prioritize Section and Subsection Structure:**
    *   The document is structured with headings and subheadings.  **First and foremost, chunk the text by sections and subsections.** Each section or subsection should ideally become a separate chunk.
    *   **Maintain Section Integrity:**  Do not split chunks across section or subsection boundaries unless absolutely necessary due to length constraints.
    *   **Use Headings as Chunk Titles:**  Use the actual section or subsection heading as the "title" field for each chunk in the JSON output. For introductory content before the first section, use "Introduction" as the title. For concluding or summary sections, use "Conclusion" or appropriate summary titles.

2.  **Semantic Coherence within Chunks:**
    *   **Each chunk must be semantically self-contained and meaningful.**  A chunk should represent a complete idea, topic, or set of related information within the document.
    *   **Prefer Paragraphs or Paragraph Groups:** Within a section or subsection, if it's still too long after section-based chunking, further divide it into chunks based on paragraphs or logical groups of paragraphs that discuss a single sub-topic.
    *   **Avoid Arbitrary Splitting:**  Do not split sentences or phrases arbitrarily in the middle just to meet the character limit.  Prioritize natural breaks in the text (paragraph breaks, topic transitions).

3.  **Maximum Chunk Size Constraint:**
    *   **Strictly adhere to a maximum chunk size of 500 characters.** This is a hard limit.
    *   **If a section, subsection, or paragraph exceeds 500 characters, you MUST split it.** Apply semantic chunking (point 2) within that longer section/paragraph to create multiple chunks, each under 500 characters.

4.  **Table Handling:**
    *   **Treat tables as distinct chunks.**  When you encounter a table, extract it as a **separate chunk.**
    *   **Structure Table Chunks:**  Ideally, represent the table in a structured format within the JSON chunk (e.g., using nested JSON objects or arrays if the 'responseSchema' allows, or use a text-based table format like Markdown if schema is limited to string content).  If direct table structuring in JSON is not feasible due to schema constraints,  represent the table content as clearly formatted text, preserving rows and columns as much as possible using tabs or spaces for alignment.
    *   **Include Table Title (if available):** If the table has a title or caption, use it as the "title" field for the table chunk. If not, generate a descriptive title like "Table: [Descriptive Topic]"

5.  **Metadata and Noise Removal (Crucial):**
    *   **Aggressively remove irrelevant metadata and noise from each chunk.**  This includes, but is not limited to:
        *   **Page numbers:**  e.g., "1/3", "2/3", "3/3"
        *   **Dates and Timestamps:** e.g., "2/21/25, 6:36 PM"
        *   **URLs and Links:** e.g., "https://wiki.gtnewhorizons.com/...", "[https://...]"
        *   **Navigation elements:** e.g., "[Expand]", "v · t · e" and associated links
        *   **Copyright notices or footers:** Any repeating text at the bottom of pages (e.g., "Low End PCs - GT New Horizons...").
        *   **Redundant Headings:**  Do not include the main document title ("GT New Horizons Low End PCs") repeatedly in every chunk unless it's genuinely part of a section heading.
    *   **Focus on Content:** Ensure each chunk primarily contains the core informational content of the document, free from distractions.

6.  **Output Format: JSON according to 'responseSchema'**:
    *   **Your response MUST be in valid JSON format.**
    *   **Strictly adhere to the 'responseSchema' provided in the 'generationConfig'.**  Ensure each chunk is represented as a JSON object with the fields defined in the schema (e.g., "title", "content", and potentially others like "section_level", "metadata" if your schema includes them).
    *   **Output an array of these JSON chunk objects.**  Each chunk should be a separate object in the array.

7. **Title**

     * Give tile of pdf`,

    generationConfig: {
        responseSchema: schemaofChunk,
        responseMimeType: 'application/json'
    }
});


export const model_mainTitle = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Extract the main title of the document.',
    generationConfig: {
        responseSchema: schemaofTitle,
        responseMimeType: 'application/json',
    }
});
