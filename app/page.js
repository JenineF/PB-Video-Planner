'use client'
 
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import TopicCard from '@/components/TopicCard'
 
function getMonthString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
 
function formatMonthDisplay(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
 
// ── Animated loading overlay shown while AI generates ──
function GeneratingOverlay() {
  const [dot, setDot] = useState(0)
  const messages = [
    'Researching digital marketing trends…',
    'Analyzing audience behavior data…',
    'Crafting topic ideas for your verticals…',
    'Scoring engagement and reach potential…',
    'Finalizing your content calendar…',
  ]
  const [msgIndex, setMsgIndex] = useState(0)
 
  useEffect(() => {
    const dotTimer = setInterval(() => setDot((d) => (d + 1) % 4), 500)
    const msgTimer = setInterval(() => setMsgIndex((m) => (m + 1) % messages.length), 3500)
    return () => { clearInterval(dotTimer); clearInterval(msgTimer) }
  }, [])
 
  const dots = '.'.repeat(dot)
 
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950/90 backdrop-blur-sm">
      {/* Double spinning rings */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute ring-spinner glow-blue" />
        <div className="ring-spinner-inner" />
        <span className="absolute text-2xl">🎯</span>
      </div>
 
      <h2 className="text-xl font-bold text-white mb-2">
        Generating Your Topics{dots}
      </h2>
      <p className="text-navy-500 text-sm transition-all duration-700 animate-pulse-slow">
        {messages[msgIndex]}
      </p>
 
      <div className="mt-8 flex gap-2">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === msgIndex ? 'bg-brand-blue scale-125' : 'bg-navy-700'
            }`}
          />
        ))}
      </div>
 
      <p className="mt-6 text-navy-700 text-xs">This usually takes 15–30 seconds</p>
    </div>
  )
}
 
// ── Stat pill in the summary bar ──
function StatPill({ label, value, color = 'text-brand-blue' }) {
  return (
    <div className="flex flex-col items-center bg-navy-900 border border-navy-800 rounded-xl px-5 py-3">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[11px] text-navy-600 mt-0.5">{label}</span>
    </div>
  )
}
 
export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(getMonthString(new Date()))
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
 
  const fetchTopics = useCallback(async (month) => {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/topics?month=${month}`)
      const data = await res.json()
      setTopics(data.topics || [])
      if (data.error) setError(data.error)
    } catch {
      setError('Failed to load topics. Check your connection.')
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [])
 
  useEffect(() => {
    fetchTopics(currentMonth)
  }, [currentMonth, fetchTopics])
 
  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth }),
      })
      const data = await res.json()
      if (data.topics) {
        setTopics(data.topics)
        if (!data.error) {
          setSuccessMsg(`10 topics generated for ${formatMonthDisplay(currentMonth)}!`)
        } else {
          setError(data.error)
        }
      } else {
        setError(data.error || 'Generation failed.')
      }
    } catch {
      setError('Generation failed. Check your API keys in .env.local.')
    } finally {
      setGenerating(false)
    }
  }
 
  const handleRegenerate = async () => {
    const confirmed = window.confirm(
      `Replace all 10 topics for ${formatMonthDisplay(currentMonth)} with brand new ones?\n\nThe current topics will be permanently deleted.`
    )
    if (!confirmed) return
 
    setGenerating(true)
    setError(null)
    setSuccessMsg(null)
    try {
      // Delete existing topics for this month
      const deleteRes = await fetch(`/api/topics?month=${currentMonth}`, { method: 'DELETE' })
      const deleteData = await deleteRes.json()
      if (!deleteData.success) throw new Error('Failed to delete existing topics.')
 
      // Generate fresh ones
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth }),
      })
      const data = await res.json()
      if (data.topics) {
        setTopics(data.topics)
        setSuccessMsg(`Fresh topics generated for ${formatMonthDisplay(currentMonth)}!`)
      } else {
        setError(data.error || 'Regeneration failed.')
      }
    } catch (err) {
      setError(err.message || 'Regeneration failed.')
    } finally {
      setGenerating(false)
    }
  }
 
  const navigateMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const date = new Date(year, month - 1 + direction, 1)
    setCurrentMonth(getMonthString(date))
  }
 
  const hasTopics = topics.length > 0
  const isCurrentMonth = currentMonth === getMonthString(new Date())
 
  // Compute averages for stats bar
  const avgEngagement = hasTopics
    ? (topics.reduce((s, t) => s + t.engagement_score, 0) / topics.length).toFixed(1)
    : '—'
  const avgReach = hasTopics
    ? (topics.reduce((s, t) => s + t.reach_score, 0) / topics.length).toFixed(1)
    : '—'
  const avgOverall = hasTopics
    ? (topics.reduce((s, t) => s + t.overall_score, 0) / topics.length).toFixed(1)
    : '—'
 
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Animated generating overlay */}
      {generating && <GeneratingOverlay />}
 
      <Header />
 
      <main className="max-w-5xl mx-auto px-4 py-8">
 
        {/* ── Month Navigation ── */}
        <div className="flex items-center justify-between mb-6 bg-navy-900 border border-navy-800 rounded-2xl px-5 py-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex items-center gap-2 text-navy-500 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-navy-800 transition-all"
          >
            ← Prev
          </button>
 
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatMonthDisplay(currentMonth)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-navy-600">
                {hasTopics ? `${topics.length} of 10 topics` : 'No topics yet'}
              </span>
              {isCurrentMonth && (
                <span className="bg-brand-blue/15 text-brand-blue text-[11px] px-2 py-0.5 rounded-full font-semibold border border-brand-blue/30">
                  Current
                </span>
              )}
            </div>
          </div>
 
          <button
            onClick={() => navigateMonth(1)}
            className="flex items-center gap-2 text-navy-500 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-navy-800 transition-all"
          >
            Next →
          </button>
        </div>
 
        {/* ── Stats Bar (only when topics exist) ── */}
        {hasTopics && !loading && (
          <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in-up">
            <StatPill label="Topics Generated" value={topics.length} color="text-white" />
            <StatPill label="Avg Engagement" value={avgEngagement} color="text-green-400" />
            <StatPill label="Avg Reach" value={avgReach} color="text-yellow-400" />
            <StatPill label="Avg Overall Score" value={avgOverall} color="text-brand-blue" />
          </div>
        )}
 
        {/* ── Alerts ── */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl mb-5 animate-fade-in-up">
            <span>✅</span>
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl mb-5 animate-fade-in-up">
            <span>⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
 
        {/* ── Loading state (fetching from DB) ── */}
        {loading && (
          <div className="text-center py-20 text-navy-600">
            <div className="text-3xl mb-3 animate-pulse">⏳</div>
            <p className="text-sm">Loading topics…</p>
          </div>
        )}
 
        {/* ── Empty state ── */}
        {!loading && !generating && !hasTopics && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-24 h-24 rounded-full border border-navy-700 animate-pulse-slow" />
              <div className="absolute w-16 h-16 rounded-full border border-navy-800" />
              <span className="text-4xl relative z-10">🎬</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No topics for {formatMonthDisplay(currentMonth)}
            </h3>
            <p className="text-navy-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Click below and GPT-4o will research the latest digital marketing trends
              to generate 10 unique video topics — tailored for all three of your verticals.
            </p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-brand-blue/30 transition-all text-sm glow-blue"
            >
              <span>✨</span>
              Generate 10 Topics for {formatMonthDisplay(currentMonth)}
            </button>
          </div>
        )}
 
        {/* ── Topic list ── */}
        {!loading && !generating && hasTopics && (
          <div className="animate-fade-in-up">
            {/* Legend + score key + regenerate button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-navy-600 font-medium">
                Click any topic to expand · Sorted by overall score
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 8–10 Strong
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 6–7 Good
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 1–5 Low
                  </span>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-brand-red text-navy-500 hover:text-brand-red text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
 
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} index={index} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
