// frontend/pages/api/whisper.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'path';
import { createReadStream } from 'fs';
import { transcribeWithProvider } from '@/lib/whisperRouter';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing error' });

    const file = files.file;
    if (!file || Array.isArray(file)) return res.status(400).json({ error: 'Missing audio file' });

    try {
      const filePath = (file as formidable.File).filepath;
      const stream = createReadStream(filePath);
      const text = await transcribeWithProvider(stream);
      return res.status(200).json({ text });
    } catch (error) {
      console.error('Transcription error:', error);
      return res.status(500).json({ error: 'Transcription failed' });
    }
  });
}
