import fs from 'fs/promises';
import path from 'path';
import {processFiles} from '../utils/pdf.ts';
import {bestChunk} from '../ai/aiFunctions.ts';
import {initializeDatabase, insertChunk} from '../db/process.ts';
import {sectionsInsert} from '../db/process.ts';
import {createSectionSummary} from './main.ts';

let directoryName = path.resolve(__dirname, '../data/');
let sectionNames = ['Introduction','Stone Age','Steam Age','LV','MV','HV','EV','IV'];


const BASE_DATA_PATH = path.resolve(__dirname, '../data');

async function processDirectory(section: string) {
  const sectionPath = path.join(BASE_DATA_PATH, section);
  const files = await fs.readdir(sectionPath);
  for (const file of files) {
    if (file.endsWith('.pdf')) {
        console.log(`Processing file: ${file}`);
      const filePath = path.join(sectionPath, file);
      const texts = await processFiles(filePath);
      console.log(`text Length: ${texts.length}`);
      for (const text of texts) {
        const chunks = await bestChunk(text);
        console.log(`Generated ${chunks.length} chunks for: ${file}`);
        for (const chunk of chunks) {
          await insertChunk(chunk.chunk, section, file);
        }
      }
    }
  }
}

async function main() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    for (const currentSection of sectionNames) {
      const sectionPath = path.join(BASE_DATA_PATH, currentSection);
      try {
        await fs.access(sectionPath);
      } catch {
        console.log(`Creating directory for section: ${currentSection}`);
        await fs.mkdir(sectionPath, { recursive: true });
      }
      console.log(`Creating summary for section: ${currentSection}`);
      await createSectionSummary(currentSection);

      console.log(`Processing documents in section: ${currentSection}`);
      await processDirectory(currentSection);
    }

    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main().catch(error => {
  console.error('Fatal error in main execution:', error);
  process.exit(1);
});