import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

export async function POST(req: Request){
    // try{
    //     const {messages } = await req.json();
    //     const response = await openai.createChatCompletion({
    //         model: 'gpt-3.5-turbo',
    //         messages,
    //         stream: true
    //     })
    //     const stream = OpenAIStream(response)
    //     return new StreamingTextResponse(stream)
    // } catch(err){

    // }
    try {
        const {messages, chatId} = await req.json();
        console.log(`--- messages from req: ${JSON.stringify(messages[0].content)}`)
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if(_chats.length != 1) {
            return NextResponse.json({error: 'chat not found'}, {status: 404});
        }
        const fileKey = _chats[0].fileKey;
        console.log(`file key from chats in neon db filekey : ${fileKey}`)

        const lastMessage = JSON.stringify(messages[0].content);

        console.log(`last message from neondb ${lastMessage}`)
        console.log('getting context')
        const context = await getContext(lastMessage, fileKey);
        console.log('got context')

        const prompt = {
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
          };
          console.log('calling create chat completion')
          const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === 'user')
            ],
            stream: true
          })

          const stream = OpenAIStream(response, {
            onStart: async () => {
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage,
                    role: 'user'
                })
            },

            onCompletion: async (completion) => {
                await db.insert(_messages).values({
                    chatId,
                    content: completion,
                    role: 'system'
                })
            }
          })
          return new StreamingTextResponse(stream);
    } catch (error) { }
}