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

## SOME ANSWERS

### How can I install GTNH and what is best params for it?

**Sub-queries:**

* GTNH installation guide
* GTNH recommended Java version
* GTNH optimal JVM arguments 
* Total Chunks Retrieved:** 357

**Answer:**
To install GTNH, use MultiMC, ATLauncher, Technic, or Prism, as CurseForge has issues with this modpack; also, consult "Installing and Migrating" if you encounter installation problems. For best performance, optimize Java's memory setup or use a Java 17+ installation with Prism/MultiMC. For parameters, allocate 4GB to 6GB of RAM, matching the minimum and maximum. On a low-end PC, offload server lifting to a spare computer, even if it is lower performance, or set up a separate server instance on the same PC.

---

### Does it have Discord channel for community? and what is link?

**Sub-queries:**

* Does GT New Horizons have an official Discord server?
* What is the official GT New Horizons Discord server invite link?
* Total Chunks Retrieved:** 244

**Answer:**
Yes, the GT New Horizons Discord is available via the link: [https://discord.gg/EXshrPV](https://discord.gg/EXshrPV).

---

### Does humidity in the air have an effect?

**Sub-query:**

* Does humidity affect GTNH gameplay?
* Total Chunks Retrieved:** 119

**Answer:**
Yes, humidity affects the water output of the Water Tank and Water Pump in GTNH. The Water Tank collects moisture from the air based on the biome's humidity, and the Water Pump's water generation rate is directly influenced by the humidity of the biome.

---

### What does it help me to make subnets in my AE2?

**Sub-queries:**

* What are the advantages of using subnets in Applied Energistics 2 (AE2) in GT New Horizons?
* How do subnets improve the performance of an AE2 network in GTNH?
* What are the best practices for designing and implementing subnets in GTNH's AE2?
* Total Chunks Retrieved:** 382

**Answer:**
Creating AE2 subnetworks helps in several ways, such as sharing power, managing channels, and isolating autocrafting processes. Subnetworks allow you to share power between a main network and its subnetworks using quartz fiber cables, which do not transfer channels. By using subnetworks, you can expose the contents of one network to another through a storage bus connected to an ME Interface, enabling interaction with items stored in the connected network, but this should be used sparingly for performance reasons. Subnets are useful for autocrafting setups, such as assemblers, circuit assembly lines, and sharing liquids.






## 📝 License

MIT

---

**GT New Horizons RAG Assistant** © 2025
