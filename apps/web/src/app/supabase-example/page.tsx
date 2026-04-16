import { createClient as createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo: { id: string; name: string }) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
