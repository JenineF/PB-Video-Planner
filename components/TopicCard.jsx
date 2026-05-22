'use client'

import { useState } from 'react'

// Score classification helpers
function scoreClass(score) {
  if (score >= 8) return 'score-high'
  if (score >= 6) return 'score-mid'
  return 'score-low'
}

function overallBorderColor(score) {
  if (score >= 8) return 'border-l-green-500'
  if (score >= 6) return 'border-l-yellow-400'
  return 'border-l-red-500'
}

function ScoreBadge({ label, value, icon }) {
  return (
    <div className={`flex flex-col items-center rounded-lg px-3 py-2 min-w-[58px] ${scoreClass(value)}`}>
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-bold leading-tight">{value}<span className="text-xs font-normal opacity-60">/10</span></span>
      <span className="text-[10px] opacity-70 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  )
}

export default function TopicCard({ topic, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`
        animate-fade-in-up
        bg-navy-900 border border-navy-800 border-l-4 ${overallBorderColor(topic.overall_score)}
        rounded-xl overflow-hidden
        hover:border-navy-700 hover:bg-navy-800/60
        transition-all duration-200 cursor-pointer
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* ── Main Row ── */}
      <div className="flex items-start gap-4 px-5 py-4">

        {/* Number badge */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-xs font-bold text-navy-500 mt-0.5">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug">
            {topic.title}
          </h3>
          <p className={`text-xs text-navy-500 mt-1 leading-relaxed ${expanded ? '' : 'line-clamp-1'}`}>
            {topic.description}
          </p>

          {/* Trend tag — always visible */}
          <div className="mt-2 inline-flex items-center gap-1.5 bg-navy-800 border border-navy-700 rounded-full px-2.5 py-1">
            <span className="text-[10px]">📈</span>
            <span className="text-[10px] text-brand-blue font-medium truncate max-w-[280px]">
              {topic.trend_basis}
            </span>
          </div>
        </div>

        {/* Score badges */}
        <div className="shrink-0 flex items-center gap-2 ml-2">
          <ScoreBadge label="Engage" value={topic.engagement_score} icon="💬" />
          <ScoreBadge label="Reach"  value={topic.reach_score}      icon="🔍" />
          <ScoreBadge label="Relev." value={topic.relevance_score}  icon="🎯" />

          {/* Divider */}
          <div className="w-px h-10 bg-navy-700 mx-1" />

          {/* Overall score */}
          <div className={`flex flex-col items-center rounded-lg px-3 py-2 min-w-[58px] ${scoreClass(topic.overall_score)}`}>
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold leading-tight">
              {topic.overall_score}<span className="text-xs font-normal opacity-60">/10</span>
            </span>
            <span className="text-[10px] opacity-70 mt-0.5">Overall</span>
          </div>
        </div>

        {/* Expand chevron */}
        <div className={`shrink-0 text-navy-600 mt-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </div>
      </div>

      {/* ── Expanded Detail Panel ── */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-navy-800 animate-fade-in-up">
          <div className="ml-12 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-navy-600 uppercase tracking-widest mb-1">Full Description</p>
              <p className="text-sm text-navy-400 leading-relaxed">{topic.description}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-navy-600 uppercase tracking-widest mb-1">Trend Basis</p>
              <p className="text-sm text-brand-blue leading-relaxed">{topic.trend_basis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
