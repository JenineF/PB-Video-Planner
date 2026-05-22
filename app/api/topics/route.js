import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET /api/topics?month=YYYY-MM  → returns topics for that month
// GET /api/topics                → returns all topics (for history view)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    let query = supabase
      .from('topics')
      .select('*')
      .order('overall_score', { ascending: false })

    if (month) {
      query = query.eq('month', month)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ topics: data })
  } catch (error) {
    console.error('[/api/topics GET] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch topics.' },
      { status: 500 }
    )
  }
}
