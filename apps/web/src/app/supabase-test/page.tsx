import { redirect } from 'next/navigation'

export default function Page() {
  // redirect old smoke test route to the new sign-in flow
  redirect('/auth/signin')
}
