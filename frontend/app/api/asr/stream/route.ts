import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('🔊 ASR /stream POST received');
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Read body as raw binary (but discard for now)
  const body = await req.arrayBuffer();
  console.log('Body length (bytes):', body.byteLength);

  return NextResponse.json({ status: 'ok', receivedBytes: body.byteLength });
}
