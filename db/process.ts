import { db } from './connect.ts';
import pgvector from 'pgvector';
import { embedText } from "../utils/embedding.ts";
import { extractKeywords, queryTransformation } from "../ai/aiFunctions.ts";

// Rate limiter for AI operations (embedding and keyword extraction)
class RateLimiter {
  private queue: (() => Promise<void>)[] = [];
  private processing = false;
  private requestsPerMinute: number;
  private requestsThisMinute = 0;
  private lastResetTime = Date.now();

  constructor(requestsPerMinute = 15) {
    this.requestsPerMinute = requestsPerMinute;
    // Reset counter every minute
    setInterval(() => {
      this.requestsThisMinute = 0;
      this.lastResetTime = Date.now();
    }, 60000);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Check if we've hit the rate limit
    if (this.requestsThisMinute >= this.requestsPerMinute) {
      const timeElapsed = Date.now() - this.lastResetTime;
      const timeToWait = Math.max(60000 - timeElapsed, 0);
      console.log(`Rate limit reached. Waiting ${timeToWait}ms before next request.`);
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      this.requestsThisMinute = 0;
      this.lastResetTime = Date.now();
    }

    // Process next item in queue
    const task = this.queue.shift();
    if (task) {
      this.requestsThisMinute++;
      await task();
    }

    // Continue processing queue
    this.processQueue();
  }
}

// Create rate limiter instance
const aiRateLimiter = new RateLimiter(15); // 15 requests per minute

// Wrapped AI functions with rate limiting
async function rateLimitedEmbedText(text: string): Promise<number[]> {
  return aiRateLimiter.execute(() => embedText(text));
}

async function rateLimitedExtractKeywords(params: {chunk_content: string, title: string}): Promise<string[]> {
  return aiRateLimiter.execute(() => extractKeywords(params));
}

async function rateLimitedQueryTransformation(query: string): Promise<{originalQuery: string, subQueries: string[]}> {
  return aiRateLimiter.execute(() => queryTransformation(query));
}

// Database initialization function - call this once at application startup
export async function initializeDatabase() {
    // Create all tables if they don't exist
    await db.transaction(async (tx) => {
        // Create main_page table
        await tx`
            CREATE TABLE IF NOT EXISTS main_page (
                id        SERIAL PRIMARY KEY,
                title     TEXT,
                href      TEXT,
                subtitle  TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Create sections table
        await tx`
            CREATE TABLE IF NOT EXISTS sections (
                section_id SERIAL PRIMARY KEY,
                section_title TEXT NOT NULL,
                section_keyword TEXT[],
                section_content TEXT,
                section_embedding VECTOR(1024),
                timestamp_updated TIMESTAMP
            );
        `;

        // Create chunks table
        await tx`
            CREATE TABLE IF NOT EXISTS chunks (
                chunk_id SERIAL PRIMARY KEY,
                chunk_content TEXT NOT NULL,
                chunk_embedding VECTOR(1024) NOT NULL,
                chunk_keyword TEXT[],
                timestamp_updated TIMESTAMP,
                section_id_fk INTEGER NOT NULL,
                page_name TEXT,
                FOREIGN KEY (section_id_fk) REFERENCES sections(section_id)
            );
        `;
    });

    // Create indices if they don't exist
    const sectionsIndexExists = await db`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'sections_embedding_idx'
    `;

    if (sectionsIndexExists.length === 0) {
        await db`CREATE INDEX sections_embedding_idx ON sections USING hnsw (section_embedding vector_l2_ops)`;
        console.log('Created HNSW index on sections table');
    }

    const chunksIndexExists = await db`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'chunks_embedding_idx'
    `;

    if (chunksIndexExists.length === 0) {
        await db`CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (chunk_embedding vector_l2_ops)`;
        console.log('Created HNSW index on chunks table');
    }

    console.log('Database initialized');
}

/**
 * Inserts the title, href, and subtitle of the main page into the main_page table.
 * @param title - The title of the main page
 * @param href - The href/URL of the main page
 * @param subtitle - The subtitle of the main page
 * @returns Promise<void>
 */
export async function mainPageInsert(title: string, href: string, subtitle: string): Promise<void> {
    await db`
        INSERT INTO main_page (title, href, subtitle) 
        VALUES (${title}, ${href}, ${subtitle});
    `;
    console.log('Main page inserted');
}

/**
 * Bulk insert multiple main pages
 * @param pages - Array of page objects with title, href, and subtitle
 * @returns Promise<void>
 */
export async function mainPageBulkInsert(pages: Array<{title: string, href: string, subtitle: string}>): Promise<void> {
    await db`
        INSERT INTO main_page (title, href, subtitle)
        VALUES ${db(pages.map(p => [p.title, p.href, p.subtitle]))}
    `;
    console.log(`Inserted ${pages.length} main pages`);
}

/**
 * Selects all records from the main_page table.
 * @returns Promise<any[]> - The selected records
 */
export async function mainPageSelect(): Promise<any[]> {
    const results = await db`
        SELECT * FROM main_page;
    `;
    console.log('Selected main pages');
    return results;
}

/**
 * Inserts a new section into the sections table with embedding and keywords.
 * @param title - The title of the section
 * @param keyword - Array of keywords related to the section
 * @param content - The main content of the section
 * @returns Promise<number> - The inserted section ID
 */
export async function sectionsInsert(title: string, keyword: string[], content: string): Promise<number> {
    // Start embedding generation early
    const embeddingPromise = rateLimitedEmbedText(content);

    // Format keywords properly
    const formattedKeywords = `{${keyword.map(k => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`;

    // Wait for embedding when needed
    const embedding = await embeddingPromise;


    const result = await db`
        INSERT INTO sections 
        (section_title, section_keyword, section_content, section_embedding, timestamp_updated) 
        VALUES (
            ${title}, 
            ${formattedKeywords}, 
            ${content}, 
            ${pgvector.toSql(embedding)}, 
            CURRENT_TIMESTAMP
        )
        RETURNING section_id;
    `;

    console.log('Section inserted with ID:', result[0]?.section_id);
    return result[0]?.section_id;
}

/**
 * Bulk insert multiple sections
 * @param sections - Array of section objects with title, keywords, and content
 * @returns Promise<number[]> - Array of inserted section IDs
 */
export async function sectionsBulkInsert(sections: Array<{title: string, keywords: string[], content: string}>): Promise<number[]> {
    // Process embeddings in parallel
    const preparedSections = await Promise.all(sections.map(async (section) => {
        const embedding = await embedText(section.content);
        const formattedKeywords = `{${section.keywords.map(k => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`;

        return {
            title: section.title,
            keywords: formattedKeywords,
            content: section.content,
            embedding: pgvector.toSql(embedding)
        };
    }));

    // Batch insert with returning IDs
    const results = await db`
        INSERT INTO sections 
        (section_title, section_keyword, section_content, section_embedding, timestamp_updated)
        VALUES ${db(preparedSections.map(s => [
            s.title,
            s.keywords,
            s.content,
            s.embedding,
            new Date()
        ]))}
        RETURNING section_id
    `;

    const sectionIds = results.map((r: any) => r.section_id);
    console.log(`Inserted ${sectionIds.length} sections`);
    return sectionIds;
}

/**
 * Inserts a chunk into the chunks table with vector embedding and related keywords.
 * @param chunk_content - The content of the chunk
 * @param section_title - The title of the section this chunk belongs to
 * @param title - The title of the page this chunk belongs to
 * @returns Promise<void>
 */
export async function insertChunk(chunk_content: string, section_title: string, title: string): Promise<void> {
    // Get the section ID and start keyword extraction and embedding in parallel

    db`CREATE TABLE IF NOT EXISTS chunks (
        chunk_id SERIAL PRIMARY KEY,
        chunk_content TEXT NOT NULL,
        chunk_embedding VECTOR(1024) NOT NULL,
        chunk_keyword TEXT[],
        timestamp_updated TIMESTAMP,
        section_id_fk INTEGER NOT NULL,
        page_name TEXT,
        FOREIGN KEY (section_id_fk) REFERENCES sections(section_id)
    );`;


    const [sectionIdResult, keys, embedding] = await Promise.all([
        db`SELECT section_id FROM sections WHERE section_title = ${section_title}`,
        rateLimitedExtractKeywords({ chunk_content, title }),
        rateLimitedEmbedText(chunk_content)
    ]);

    if (!sectionIdResult.length) {
        throw new Error(`Section with title "${section_title}" not found`);
    }

    const section_id_fk = sectionIdResult[0].section_id;
    const formattedKeywords = `{${keys.map(key => `"${key.replace(/[{}]/g, '\\"')}"`).join(',')}}`;

    await db`
        INSERT INTO chunks 
        (chunk_content, chunk_embedding, chunk_keyword, section_id_fk, page_name, timestamp_updated) 
        VALUES (
            ${chunk_content}, 
            ${pgvector.toSql(embedding)}, 
            ${formattedKeywords}, 
            ${section_id_fk}, 
            ${title}, 
            CURRENT_TIMESTAMP
        )
    `;

    console.log('Chunk inserted');
}

/**
 * Inserts multiple chunks in batch for better performance
 * @param chunks - Array of chunk objects
 * @returns Promise<void>
 */
export async function insertChunksBatch(chunks: Array<{
    content: string,
    section_title: string,
    title: string
}>): Promise<void> {
    if (chunks.length === 0) return;

    // Get all unique section titles
    const uniqueSectionTitles = [...new Set(chunks.map(c => c.section_title))];

    // Get all section IDs in one query
    const sectionResults = await db`
        SELECT section_id, section_title 
        FROM sections 
        WHERE section_title IN ${db(uniqueSectionTitles)}
    `;

    // Map section titles to IDs
    const sectionMap = new Map<string, number>();
    sectionResults.forEach((row: any) => {
        sectionMap.set(row.section_title, row.section_id);
    });

    // Check if all sections exist
    const missingSections = uniqueSectionTitles.filter(title => !sectionMap.has(title));
    if (missingSections.length > 0) {
        throw new Error(`Sections not found: ${missingSections.join(', ')}`);
    }

    // Process chunks in batches to avoid memory issues
    const BATCH_SIZE = 20;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        // Process each chunk in the batch in parallel
        const preparedChunks = await Promise.all(batch.map(async (chunk) => {
            const [keys, embedding] = await Promise.all([
                extractKeywords({chunk_content: chunk.content, title: chunk.title}),
                embedText(chunk.content)
            ]);

            const section_id_fk = sectionMap.get(chunk.section_title);
            const formattedKeywords = `{${keys.map(key => `"${key.replace(/[{}]/g, '\\"')}"`).join(',')}}`;

            return [
                chunk.content,
                pgvector.toSql(embedding),
                formattedKeywords,
                section_id_fk,
                chunk.title,
                new Date()
            ];
        }));

        // Batch insert
        await db`
            INSERT INTO chunks 
            (chunk_content, chunk_embedding, chunk_keyword, section_id_fk, page_name, timestamp_updated)
            VALUES ${db(preparedChunks)}
        `;

        console.log(`Inserted chunk batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(chunks.length/BATCH_SIZE)}`);
    }
}

/**
 * Embeds a list of queries and retrieves the most relevant sections and chunks from the database.
 * @param query - The search query
 * @param settings - Optional settings for limiting results and weighting
 * @returns Promise<{ allResults: any[][]; queries: string[] }>
 */
export async function embeddingSectionHybrid(
    query: string,
    settings = {
        CHUNK_LIMIT: 10,
        EMBEDDING_WEIGHT: 0.7,
        KEYWORD_WEIGHT: 0.3,
        CONTEXT_WINDOW: 2
    }
): Promise<{ allResults: any[][]; queries: string[] }> {
    // Transform the query to handle complex cases
    const { originalQuery, subQueries } = await rateLimitedQueryTransformation(query);
    console.log(subQueries);

    if (!Array.isArray(subQueries)) {
        throw new Error('Parameter "queries" must be an array');
    }

    // Process all sub-queries in parallel
    const queryPromises = subQueries.map(async (subQuery) => {
        try {
            // Process embedding and keywords extraction in parallel
            const [vec, keywords] = await Promise.all([
                rateLimitedEmbedText(subQuery),
                rateLimitedExtractKeywords({ chunk_content: subQuery, title: subQuery })
            ]);

            console.log("Keywords:", keywords);

            // Format the keywords as a proper PostgreSQL array string
            const keywordArray = `{${keywords.map(k => `"${k.toLowerCase().replace(/"/g, '\\"')}"`).join(',')}}`;

            // Get chunks with hybrid scoring and include context windows
            return db`
    WITH ranked_chunks AS (
        SELECT
            chunk_id,
            chunk_content,
            page_name,
            1 - (chunk_embedding <-> ${pgvector.toSql(vec)}) / 2 AS embedding_score,
            cardinality(
                array(
                    SELECT unnest(chunk_keyword)
                    INTERSECT
                    SELECT unnest(${keywordArray}::text[])
                )
            )::float AS keyword_match_count,
            (
                ${settings.EMBEDDING_WEIGHT} * (1 - (chunk_embedding <-> ${pgvector.toSql(vec)}) / 2) +
                ${settings.KEYWORD_WEIGHT} * LEAST(
                    cardinality(
                        array(
                            SELECT unnest(chunk_keyword)
                            INTERSECT
                            SELECT unnest(${keywordArray}::text[])
                        )
                    )::float,
                    5
                ) / 5
            ) AS score
        FROM chunks
    ),
    top_chunks AS (
        SELECT *
        FROM ranked_chunks
        ORDER BY score DESC
        LIMIT ${settings.CHUNK_LIMIT}
    ),
    context_chunks AS (
        SELECT 
            c.chunk_id,
            c.chunk_content,
            c.page_name,
            c.chunk_keyword,
            c.timestamp_updated,
            c.section_id_fk
        FROM chunks c
        JOIN top_chunks t
            ON c.page_name = t.page_name
            AND c.chunk_id BETWEEN t.chunk_id - ${settings.CONTEXT_WINDOW} AND t.chunk_id + ${settings.CONTEXT_WINDOW}
    )
    SELECT DISTINCT *
    FROM context_chunks
    ORDER BY page_name, chunk_id
    `.values();
        } catch (error) {
            console.error(`Error retrieving chunks for query "${subQuery}":`, error);
            return [];
        }
    });

    // Wait for all query results
    const allResults = await Promise.all(queryPromises);

    return { allResults, queries: subQueries };
}