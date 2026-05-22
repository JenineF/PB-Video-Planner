import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Use the service role key here (server-side only, never exposed to browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  try {
    const { month } = await request.json() // expected format: "YYYY-MM"

    if (!month) {
      return NextResponse.json({ error: 'Month is required (format: YYYY-MM)' }, { status: 400 })
    }

    // ── Guard: Don't regenerate if topics already exist for this month ──
    const { data: existingTopics, error: existingError } = await supabase
      .from('topics')
      .select('*')
      .eq('month', month)
      .order('overall_score', { ascending: false })

    if (existingError) throw existingError

    if (existingTopics && existingTopics.length > 0) {
      return NextResponse.json(
        {
          error: `Topics for ${month} are already generated. Navigate to a different month to generate new ones.`,
          topics: existingTopics,
        },
        { status: 400 }
      )
    }

    // ── Fetch all past topic titles to prevent repetition ──
    const { data: allPastTopics, error: pastError } = await supabase
      .from('topics')
      .select('title')
      .order('created_at', { ascending: false })

    if (pastError) throw pastError

    const pastTitlesList = allPastTopics?.map((t) => `"${t.title}"`) || []
    const pastTopicsContext =
      pastTitlesList.length > 0
        ? `IMPORTANT — Previously generated topics (you must NOT repeat or closely resemble any of these):\n${pastTitlesList.join('\n')}`
        : 'No previous topics have been generated yet.'

    // ── Build the prompt ──
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    const prompt = `You are a senior digital marketing content strategist specializing in video content for small service businesses.

Today is ${currentDate}. Your task is to generate exactly 10 unique, high-performing video content topic ideas for a personal branding series.

CONTEXT:
- These topics must serve three business verticals simultaneously: Funeral Homes, Home Care Services, and Home Improvement Companies.
- All topics must be about DIGITAL MARKETING — strategies, tips, trends, and tactics that business owners in these verticals can use to grow their online presence and attract clients.
- Topics must be generic enough to apply to all three verticals (e.g., "How to Use Customer Testimonials in Video Marketing" works for all three).
- Base topics on what is currently trending and relevant in digital marketing as of ${currentDate}.

${pastTopicsContext}

For each topic, provide:
1. "title" — A compelling, specific video title (not generic like "Tips for Social Media")
2. "description" — 2 sentences explaining exactly what the video covers and what viewers will learn
3. "trend_basis" — The specific current digital marketing trend this topic is based on (e.g., "AI-generated content tools", "Short-form video dominance on Instagram Reels")
4. "engagement_score" — Integer 1–10: How likely viewers are to like, comment, share, or save this video
5. "reach_score" — Integer 1–10: Potential for organic reach, SEO value, and discoverability
6. "relevance_score" — Integer 1–10: How timely and relevant this is to current 2026 digital marketing trends

Scoring guide:
- 9–10: Exceptional — highly shareable, very timely, strong search demand
- 7–8: Strong — solid engagement potential, relevant trend
- 5–6: Average — decent but not outstanding
- Below 5: Weak — avoid these

Return ONLY valid JSON with no extra text, in this exact structure:
{
  "topics": [
    {
      "title": "...",
      "description": "...",
      "trend_basis": "...",
      "engagement_score": 8,
      "reach_score": 7,
      "relevance_score": 9
    }
  ]
}`

    // ── Call OpenAI ──
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 3000,
    })

    const result = JSON.parse(completion.choices[0].message.content)

    if (!result.topics || !Array.isArray(result.topics)) {
      throw new Error('OpenAI returned an unexpected response format.')
    }

    // ── Add month + overall_score, then save to Supabase ──
    const topicsToInsert = result.topics.map((topic) => ({
      title: topic.title,
      description: topic.description,
      trend_basis: topic.trend_basis,
      engagement_score: topic.engagement_score,
      reach_score: topic.reach_score,
      relevance_score: topic.relevance_score,
      month,
      overall_score: Math.round(
        (topic.engagement_score + topic.reach_score + topic.relevance_score) / 3
      ),
    }))

    const { data: insertedTopics, error: insertError } = await supabase
      .from('topics')
      .insert(topicsToInsert)
      .select()

    if (insertError) throw insertError

    // Return sorted by overall_score descending
    const sorted = insertedTopics.sort((a, b) => b.overall_score - a.overall_score)

    return NextResponse.json({ topics: sorted })
  } catch (error) {
    console.error('[/api/generate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
