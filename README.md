```markdown
# GT New Horizons RAG Assistant

A retrieval\-augmented generation \(RAG\) pipeline for answering questions about the GT New Horizons Minecraft modpack.

## Features

\- **Hybrid Search Engine**: Uses vector embeddings and keyword matching  
\- **Text Chunking**: Splits large documents \(over 30k characters\) into manageable parts for processing  
\- **Query Transformation**: Handles complex questions by breaking them into sub\-queries  
\- **Document Processing**: Extracts optimal chunks from PDF and text sources  
\- **PostgreSQL Vector Database**: Employs pgvector for efficient similarity search  
\- **AI\-Powered Answer Synthesis**: Generates concise answers from retrieved content

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
└── main/
    └── main.ts              # Main Functions
    └── test.ts              # Example usage and testing
```

## Tech Stack

\- TypeScript/Node\.js  
\- PostgreSQL with pgvector  
\- Vector embeddings  
\- LLMs for query transformation and answer synthesis

## Installation

```bash
npm install
cp .env.example .env
# Update .env with your database and API credentials
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

Use optional chunk splitting for large inputs to avoid token overflow.
```
