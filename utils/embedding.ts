import { pipeline } from '@huggingface/transformers';

// Create a feature extraction pipeline
const extractor = await pipeline(
    "feature-extraction",
    "lightonai/modernbert-embed-large",
    { dtype: "fp32" }
);

export async function embedText(text: string): Promise<number[]> {
        const query_embeddings = await extractor([text], { pooling: "mean", normalize: true });
        // @ts-ignore
        return Array.from(query_embeddings['ort_tensor']['cpuData']);
}