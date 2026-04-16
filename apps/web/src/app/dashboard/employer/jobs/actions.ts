"use server"

import { cookies as getCookies } from "next/headers"
import createServerClient from "@/utils/supabase/server"

export async function createJobAction(formData: FormData): Promise<Record<string, unknown>> {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const visibility = (formData.get("visibility") as string) || "private"
  const status = (formData.get("status") as string) || "draft"

  const supabase = createServerClient(await getCookies())

  // Get current user from auth cookie
  const { data: { session } = { session: null } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase.from("jobs").insert({
    title,
    description,
    visibility,
    status,
    created_by: userId,
  }).select().single()

  if (error) {
    throw error
  }

  return data
}
