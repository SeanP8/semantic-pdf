import { Pinecone } from "@pinecone-database/pinecone";
import { indexName } from "./config";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export async function getMatchesFromEmbeddings(embeddings, fileKey){
    try {
        const client = new Pinecone({
            environment: process.env.PINECONE_ENV!,
            apiKey: process.env.PINECONE_API_KEY!,
        });
        console.log(`indexName ${indexName}`)
        const pineconeIndex = client.Index(indexName)
        console.log(`------- pineconeIndex ${pineconeIndex[0]}`)
        const namespace = pineconeIndex;
        console.log(`pinecone namespace: ${namespace}`)
        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true
        })
        return queryResult.matches || []

    } catch (error) {
        console.log('error querying embeddings', error);
        throw error;
    }
}


export async function getContext(query: string, fileKey: string){
    console.log('calling get embeddings from get context with query ', query)
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter(
        (match) => match.score && match.score > 0.7
    )

    type Metadata = {
        text: string;
        pageNumber: number;
    };

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    return docs.join('\n').substring(0, 3000)
}