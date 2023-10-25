import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { timeout } from "./config";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAI } from 'langchain/llms/openai'
import { loadQAStuffChain } from 'langchain/chains'
import { Document } from 'langchain/document'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}

export const createPineconeIndex = async (client, indexName, vectorDimension) => {
  console.log(`Checking "${indexName}"...`);
 
  const existingIndexes = await client.listIndexes();
  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating "${indexName}"...`);
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: 'cosine'
      }
    });

    console.log(`Creating index... pleas wait for it to finish initializing`);
    await new Promise((resolve) => setTimeout(resolve, timeout))
  } else {
    console.log(`"${indexName}" already exists.`)
  }
}

export const updatePinecone = async (client, indexName, docs) => {
    console.log('Retrieving Pinecone Index... ');

    const index = client.Index(indexName);
    console.log(`Pinecone index retrieved: ${indexName}`);

    for (const doc of docs){
      console.log(`Processing document: ${doc.metadata.source}`);
      const txtPath = doc.metadata.source;
      const text = doc.pageContent;

      const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000});
      
      console.log('Splitting text into chunks...');
      const chunks = await textSplitter.createDocuments([text])
      console.log(`Text split into ${chunks.length} chunks`)

      console.log(
        `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
      );
      const  embeddingsArrays = await new OpenAIEmbeddings().embedDocuments( chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " ")))
      console.log('Finished embedding documents');
      console.log(
        `Creating ${chunks.length} vectors array with id, values, and metadata...`
      );

      const batchSize = 100;
      let batch:any = [];
      for (let idx = 0; idx < chunks.length; idx++){
        const chunk = chunks[idx];
        const vector = {
          id: `${txtPath}_${idx}`,
          values: embeddingsArrays[idx],
          metadata: {
            ...chunk.metadata,
            loc: JSON.stringify(chunk.metadata.loc),
            pageContent: chunk.pageContent,
            txtPath: txtPath
          }
        };
        batch = [...batch, vector]

        if (batch.length === batchSize || idx === chunks.length - 1){
          
          await index.upsert(batch);
          batch = []
        }
      }
      // number of vectors updated
      console.log(`Pinecone index updated with ${chunks.length} vectors`);
    }
}