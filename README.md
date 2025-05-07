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

`processDocument(filePath, sectionName, fileName)` Processes a single file, extracts text, splits it into chunks, and inserts them into the database.  
`processDirectory(directoryName)` Reads and iterates over each file in the specified directory and processes each document.  
`createSectionSummary(directoryName)` Loads text from a directory, generates a summary and keywords, and inserts this information into the database.  
`Question(question, settings)` Runs a Rag pipeline for the given question, performing searching and retrieval through embeddings and keywords.  
`processSections(sectionNames)` Summarizes and processes multiple sections by iterating through their corresponding directories.  
`TryQuestion(text)` Tests a sample query using the `Question` function and logs the result.  
`startEvent()` Initializes an event handler to manage chat interactions.
## 💡 Tips

- Modify the default search settings (`DEFAULT_SEARCH_SETTINGS`) to fine-tune chunk limits and weighting
- Ensure the database setup in `db/process.ts` is properly initialized before running chunk or summary operations
- Use `TryQuestion()` or custom calls to test question-answer workflows
- Use optional chunk splitting for large inputs to avoid token overflow
- Adjust weights between embedding and keyword search based on your specific use case
- Increase `CHUNK_LIMIT` for more comprehensive results (may increase processing time)

---

### What is GTNH mod pack?

**Sub-topics:** Overview, Key Features, Difficulty & Progression, GregTech Integration
**Retrieved Chunks:** 448
**Answer:**
GT New Horizons (GTNH) is a GregTech-based modpack for Minecraft 1.7.10, focused on long-term progression through tech tiers. It features complex recipes, gated progression, and heavy use of machines. Best experienced with the quest book and on multiplayer servers.

---

###  How do I install GTNH? What are the system requirements? Is there a Discord server?

**Sub-topics:** Installation, Requirements, Discord Server
**Retrieved Chunks:** 343
**Answer:**
Install GTNH using MultiMC, ATLauncher, Technic, or Prism (avoid CurseForge). Allocate 4–6 GB RAM and use Java 17+ for better performance. Join the community via [Discord](https://discord.gg/EXshrPV).

---

### 🛠Can I help develop GTNH?

**Sub-topics:** Contribution and Development
**Retrieved Chunks:** 101
**Answer:**
Yes! Contributions are welcome via GitHub or Discord. Fork a mod repository, make improvements, and submit pull requests.

---

### What's the fastest way to get power in early GTNH?

**Sub-topics:** Early Game Power Generation
**Retrieved Chunks:** 526
**Answer:**
Start with basic steam setups, then progress to Cetane-Boosted Diesel in HV. Later, Large Gas Turbines and Solid-Oxide Fuel Cells offer efficient power solutions.

---

### Who develops GTNH?

**Sub-topics:** Developer Team, Roles, Contributions
**Retrieved Chunks:** 481
**Answer:**
GTNH is community-developed. Anyone can contribute via GitHub by fixing bugs or adding features. Use the Discord `#mod-dev` channel and follow coding guidelines.

---

### Does GTNH cause mental health issues?

**Sub-topics:** Mental Impact
**Retrieved Chunks:** 124
**Answer:**
GTNH is extremely time-consuming and can be frustrating without proper planning. Solo play may take 3,000+ hours—it's recommended to read the quest book and play with others to avoid burnout.

---





## 📝 License

MIT

---

**GT New Horizons RAG Assistant** © 2025
