import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    console.log('calling open ai create embeddings v2', text)
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    const result = await response.json();
    console.log('embeddings openai result -- ')
    return result.data[0].embedding;
  } catch (error) {
    console.log("error calling openai embeddings api", error);
    throw error;
  }
}
