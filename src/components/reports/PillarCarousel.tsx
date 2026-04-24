'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Users, MapPin, DollarSign, User } from 'lucide-react'
import type { FeasibilityScore } from '@/lib/feasibility'

function scoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#2563EB'
  if (score >= 40) return '#F59E0B'
  if (score >= 20) return '#F97316'
  return '#EF4444'
}

const PILLAR_META: Record<string, { label: string; Icon: React.ElementType }> = {
  market:      { label: 'Market Opportunity',  Icon: TrendingUp },
  competition: { label: 'Competition',          Icon: Users },
  location:    { label: 'Location Viability',   Icon: MapPin },
  financial:   { label: 'Financial Readiness',  Icon: DollarSign },
  personal:    { label: 'Personal Readiness',   Icon: User },
}

interface Props {
  pillars: FeasibilityScore['pillars']
}

export default function PillarCarousel({ pillars }: Props) {
  const [index, setIndex] = useState(0)

  const entries = Object.entries(pillars) as [keyof typeof pillars, typeof pillars[keyof typeof pillars]][]
  const total = entries.length
  const [name, pillar] = entries[index]
  const meta = PILLAR_META[name]
  const color = scoreColor((pillar.score / 20) * 100)
  const barPct = (pillar.score / 20) * 100

  function prev() { setIndex(i => (i - 1 + total) % total) }
  function next() { setIndex(i => (i + 1) % total) }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-navy)] text-white rounded-xl p-2">
            <meta.Icon size={15} />
          </div>
          <div>
            <div className="font-bold text-[var(--color-navy)] text-sm">{meta.label}</div>
            <div className="text-[11px] text-[var(--color-slate)] mt-0.5">Pillar {index + 1} of {total}</div>
          </div>
        </div>
        <span className="text-sm font-extrabold" style={{ color }}>{pillar.score}/20</span>
      </div>

      {/* Score bar */}
      <div className="px-5 pb-4">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F0EDE8' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barPct}%`, backgroundColor: color }}
          />
        </div>
        <div className="text-[11px] text-[var(--color-slate)] mt-1.5">
          Weighted contribution: <strong>{pillar.weighted_score} pts</strong>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 pb-5 space-y-4 min-h-[180px]">
        {/* Highlights */}
        {pillar.highlights.length > 0 && (
          <ul className="space-y-2">
            {pillar.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-foreground)]">
                <span
                  className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Insight */}
        <p className="text-xs text-[var(--color-slate)] italic leading-relaxed border-t border-[var(--color-border)] pt-3">
          {pillar.insight}
        </p>
      </div>

      {/* Navigation footer */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]"
        style={{ background: '#F7F4EF' }}
      >
        <button
          onClick={prev}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors"
        >
          <ChevronLeft size={15} /> Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {entries.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width:  i === index ? 18 : 6,
                height: 6,
                background: i === index ? 'var(--color-navy)' : '#D1CDCA',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
