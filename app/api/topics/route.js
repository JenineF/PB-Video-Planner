import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  const checks = {
    supabase_url_set: !!url,
    supabase_url_full: url || 'NOT SET',
    supabase_url_length: url?.length ?? 0,
    supabase_url_starts_with_https: url?.startsWith('https://') ?? false,
    supabase_url_has_trailing_slash: url?.endsWith('/') ?? false,
    supabase_url_contains_supabase_co: url?.includes('.supabase.co') ?? false,
    service_role_key_set: !!serviceKey,
    service_role_key_length: serviceKey?.length ?? 0,
    service_role_key_preview: serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT SET',
    anon_key_set: !!anonKey,
    anon_key_length: anonKey?.length ?? 0,
    anon_key_preview: anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET',
    openai_key_set: !!openaiKey,
    openai_key_starts_with_sk: openaiKey?.startsWith('sk-') ?? false,
  }

  // Raw fetch test — bypasses the JS client entirely
  let rawFetchTest = null
  try {
    const rawUrl = `${url}/rest/v1/topics?select=id&limit=1`
    const res = await fetch(rawUrl, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      }
    })
    const body = await res.text()
    rawFetchTest = { status: res.status, body: body.substring(0, 300) }
  } catch (e) {
    rawFetchTest = { error: e.message }
  }

  // Supabase JS client test
  let supabaseTest = null
  try {
    const supabase = createClient(url, serviceKey)
    const { data, error } = await supabase.from('topics').select('id').limit(1)
    supabaseTest = error
      ? { success: false, error_code: error.code, error_message: error.message }
      : { success: true, rows_returned: data.length }
  } catch (e) {
    supabaseTest = { success: false, thrown_error: e.message }
  }

  return NextResponse.json({ checks, rawFetchTest, supabaseTest }, { status: 200 })
}
