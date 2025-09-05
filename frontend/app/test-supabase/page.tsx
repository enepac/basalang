import { supabase } from '@basalang/shared'

export default async function SupabaseTestPage() {
  const { data, error } = await supabase.from('config').select('*')

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Supabase Test Query</h1>
      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-sm">
        {JSON.stringify(error ?? data, null, 2)}
      </pre>
    </div>
  )
}
