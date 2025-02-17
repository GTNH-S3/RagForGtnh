import { model_keyword,model_test,model_queryTransformation} from "./models.ts";



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

