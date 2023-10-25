import { Pinecone, PineconeClient, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { indexName } from "@/lib/config";
import { createPineconeIndex, updatePinecone } from "@/lib/utils";
import { NextResponse } from "next/server";




export async function loadS3IntoPinecone(fileKey: string){
    console.log('downloading s3 into file system');
    const file_name = await downloadFromS3(fileKey);

    console.log('loaded from s3 ' + file_name)

    // const extension = file_name?.slice((Math.max(0, file_name.lastIndexOf(".")) || Infinity) + 1);

 
    const loader = new TextLoader(file_name!)

    // const loader = new DirectoryLoader(file_name!, {
    //     '.txt': (path) => new TextLoader(path),
    //     ".md": (path) => new TextLoader(path),
    //     ".pdf": (path) => new PDFLoader(path)
    // })

    const docs = await loader.load()
    const vectorDimensions = 1536

    const client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENV!,
    })
    
    try {
        // await createPineconeIndex(client, indexName, vectorDimensions)
        await updatePinecone(client, indexName, docs)
    } catch (err) {
        console.log('error: ', err)
    }

    return NextResponse.json({
        data: 'successfully created index and loaded data into pinecone...'
    })
}