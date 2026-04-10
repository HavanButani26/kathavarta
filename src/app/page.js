import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Kathavarta 📚</h1>
      <p>Supabase connected ✅</p>
      <p>User: {user ? user.email : 'Not logged in'}</p>
    </main>
  )
}