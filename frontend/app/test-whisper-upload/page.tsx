'use client'

import { useState } from 'react'

export default function WhisperUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('provider', 'whisper')

    setLoading(true)
    try {
      const res = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      setResponse(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Whisper Upload</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Uploading...' : 'Submit to /api/whisper'}
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap break-words">
            {response}
          </pre>
        </div>
      )}
    </main>
  )
}
// frontend/app/test-whisper-upload/page.tsx