// frontend/lib/whisperRouter.ts
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

const PROVIDER = process.env.TRANSCRIBE_PROVIDER || 'faster-whisper';

export async function transcribeWithProvider(stream: Readable): Promise<string> {
  switch (PROVIDER) {
    case 'faster-whisper':
      return await transcribeLocal(stream);
    case 'deepgram':
      return await transcribeViaDeepgram(stream);
    case 'openai':
      return await transcribeViaOpenAI(stream);
    default:
      throw new Error(`Unsupported TRANSCRIBE_PROVIDER: ${PROVIDER}`);
  }
}

async function transcribeLocal(stream: Readable): Promise<string> {
  const formData = new FormData();
  formData.append('file', stream, 'audio.wav');

  const res = await axios.post('http://localhost:9000/transcribe', formData, {
    headers: formData.getHeaders(),
  });

  return res.data.text || '[empty]';
}

async function transcribeViaDeepgram(stream: Readable): Promise<string> {
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  if (!DEEPGRAM_API_KEY) throw new Error('Missing DEEPGRAM_API_KEY');

  const formData = new FormData();
  formData.append('file', stream, 'audio.wav');

  const res = await axios.post('https://api.deepgram.com/v1/listen', formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
    },
  });

  const transcript = res.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  return transcript || '[empty]';
}

async function transcribeViaOpenAI(stream: Readable): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const formData = new FormData();
  formData.append('file', stream, 'audio.wav');
  formData.append('model', 'whisper-1');

  const res = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });

  return res.data.text || '[empty]';
}
