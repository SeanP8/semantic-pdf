
import { loadS3IntoPinecone } from "@/components/Pinecone";
import { getS3Url } from "@/components/s3";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import md5 from "md5";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response){
    try {
        const body = await req.json();
        const {file_key, file_name} = body;
        console.log('file key path: ', file_key)
        
        console.log(`loading into pinecone ${file_key}`)
        await loadS3IntoPinecone(file_key);

        let chatId = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: getS3Url(file_key),
            userId: file_key
        })
        .returning({insertedId: chats.id})

        console.log('create chat api',chatId)

        return NextResponse.json({
            chat_id: chatId[0].insertedId
        },
        {status: 200}
        )

    } catch (error){
        console.error('create chat post api error --- \n', error)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
          );
    }
}