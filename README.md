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
- In `main/main.ts`, several functions (`processDocument`, `processDirectory`, `createSectionSummary`, etc.) handle reading and storing document chunks.
- `Question(question: string)` demonstrates a RAG-based pipeline that retrieves relevant chunks, synthesizes an answer, and returns it.
- `batchTestQuestions()` runs multiple queries in sequence.
- `compareSearchSettings()` compares different embedding and keyword weighting strategies.

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
