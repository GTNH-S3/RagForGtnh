# 🚀 GT New Horizons RAG Assistant

> A retrieval-augmented generation (RAG) pipeline for answering questions about the GT New Horizons Minecraft modpack.

## ✨ Features

- **Hybrid Search Engine**: Uses vector embeddings and keyword matching for optimal results
- **Text Chunking**: Splits large documents (over 30k characters) into manageable parts
- **Query Transformation**: Handles complex questions by breaking them into sub-queries
- **Document Processing**: Extracts optimal chunks from PDF and text sources
- **PostgreSQL Vector Database**: Employs pgvector for efficient similarity search
- **AI-Powered Answer Synthesis**: Generates concise answers from retrieved content

## 📋 Overview

This project applies chunking, summarization, and keyword extraction to documents. It leverages various models defined in `ai/models.ts` (e.g. `model_keyword`, `model_answer_synthesis`) to process GT New Horizons (*GTNH*)-related data. The main logic resides in `main/main.ts`, which integrates with the database through utility functions in `db/process.ts`.

## 🏗️ Architecture

```
├── ai/
│   ├── aiFunctions.ts       # Core AI pipeline functions
│   └── models.ts            # LLM configurations
├── db/
│   └── process.ts           # Database operations and vector search
├── utils/
│   ├── embedding.ts         # Text embedding utilities
│   ├── pdf.ts               # PDF processing
│   └── sleep.ts             # Utility functions
└── main/
    └── main.ts              # Main Functions
```

## 🔧 Tech Stack

- TypeScript/Node.js
- PostgreSQL with pgvector
- Vector embeddings
- LLMs for query transformation and answer synthesis


### Core Functions
Below are brief descriptions for each function referenced in this project:

- **mainPage()**  
  Retrieves the GTNH wiki main page, parses sections, and returns an array of section objects.

- **introduction(link)**  
  Fetches titles and paragraphs from a given URL and returns them in two arrays.

- **RateLimiter** (class)  
  Controls the rate of API calls using a queue and processes them in order.

- **RateLimiter.execute(fn)**  
  Adds a function to the queue and runs it in a rate-limited manner.

- **initializeDatabase()**  
  Creates the necessary tables (if they do not exist) and sets up indices for vector search.

- **mainPageInsert(title, href, subtitle)**  
  Inserts a single record into the `main_page` table.

- **mainPageBulkInsert(pages)**  
  Inserts multiple records into `main_page` in a single operation.

- **mainPageSelect()**  
  Fetches all records from the `main_page` table.

- **sectionsInsert(title, keyword, content)**  
  Inserts a record into the `sections` table with generated embeddings and keywords.

- **sectionsBulkInsert(sections)**  
  Inserts multiple sections in bulk after generating embeddings.

- **insertChunk(chunk_content, section_title, title)**  
  Embeds a chunk, extracts its keywords, and inserts it into the `chunks` table.

- **insertChunksBatch(chunks)**  
  Performs batch insert of multiple chunks with embeddings and keywords.

- **embeddingSectionHybrid(query, settings)**  
  Transforms the query, embeds it, extracts keywords, and retrieves relevant chunks using a hybrid search.

- **processDocument(filePath, sectionName, fileName)**  
  Processes a document (PDF or text), creates chunks, and stores them in the database.

- **processDirectory(directoryName)**  
  Iterates over files in a directory and processes each with `processDocument`.

- **createSectionSummary(directoryName)**  
  Summarizes a specified section by generating a summary, extracting keywords, and storing them.

- **Question(question, settings)**  
  Runs the hybrid retrieval and a final RAG pipeline for a given query.

- **processSections(sectionNames)**  
  Creates summaries for each section and processes all documents in the list.

- **TryQuestion(text)**  
  Tests a question through the RAG pipeline and logs the result.

- **startEvent()**  
  Starts an event handler that manages chat interactions.

## 💡 Tips

- Modify the default search settings (`DEFAULT_SEARCH_SETTINGS`) to fine-tune chunk limits and weighting
- Ensure the database setup in `db/process.ts` is properly initialized before running chunk or summary operations
- Use `TryQuestion()` or custom calls to test question-answer workflows
- Use optional chunk splitting for large inputs to avoid token overflow
- Adjust weights between embedding and keyword search based on your specific use case
- Increase `CHUNK_LIMIT` for more comprehensive results (may increase processing time)

## 📝 License

MIT

---

**GT New Horizons RAG Assistant** © 2025
