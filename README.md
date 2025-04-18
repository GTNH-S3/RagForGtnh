# GT New Horizons RAG Assistant

A retrieval-augmented generation (RAG) pipeline for answering questions about the GT New Horizons Minecraft modpack.

## Features

- **Hybrid Search Engine**: Combines vector embeddings and keyword matching for accurate document retrieval
- **Query Transformation**: Handles complex questions by breaking them into sub-queries
- **Document Processing**: PDF and text processing with chunk extraction and optimization
- **PostgreSQL Vector Database**: Uses pgvector for efficient similarity search
- **AI-Powered Answer Synthesis**: Generates comprehensive answers based on retrieved content

## Architecture

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
└── test/
    └── test.ts              # Example usage and testing
```

## Tech Stack

- TypeScript/Node.js
- PostgreSQL with pgvector extension
- Vector embeddings (1024-dimensional)
- LLMs for query transformation and answer synthesis

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gtnh-rag.git
cd gtnh-rag

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials
```

## Usage

```typescript
import { completeRagPipeline } from '../ai/aiFunctions';
import { embeddingSectionHybrid } from '../db/process';

const question = 'How do I get to the HV tier in GT New Horizons?';

const answer = await completeRagPipeline(
    question,
    embeddingSectionHybrid(question, {
        CHUNK_LIMIT: 10,
        EMBEDDING_WEIGHT: 0.7,
        KEYWORD_WEIGHT: 0.3
    })
);

console.log(answer);
```

