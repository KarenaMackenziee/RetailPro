"use client"

import { createClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createClient> | null = null

export function createClientClient() {
  if (supabaseClient) return supabaseClient

  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  return supabaseClient
}
