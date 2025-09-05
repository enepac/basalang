// Shared ASR constants and types

export const AUDIO_SAMPLE_RATE = 16000; // 16kHz — compatible with Whisper
export const ASR_CHUNK_DURATION_MS = 500; // Chunk length in milliseconds

export type AudioChunk = {
  buffer: ArrayBuffer;
  timestamp: number;
  sequenceId: number;
};
