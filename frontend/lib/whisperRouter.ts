import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function transcribeWithOpenAI(filepath: string): Promise<string | null> {
  try {
    const fileStream = fs.createReadStream(filepath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "json",
    });

    return response.text;
  } catch (error) {
    console.error("OpenAI transcription error:", error);
    return null;
  }
}

export async function transcribeWithProvider(
  provider: string,
  filepath: string
): Promise<string | null> {
  switch (provider) {
    case "openai":
    case "whisper":
      return await transcribeWithOpenAI(filepath);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
