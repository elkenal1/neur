import { type FeasibilityScore } from '@/lib/feasibility'
import {
  TrendingUp,
  CheckCircle, AlertTriangle, Lock, Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import RecalculateButton from './RecalculateButton'
import PillarCarousel from './PillarCarousel'

// ─── Score ring ───────────────────────────────────────────────────────────────

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score: number): string {
  if (score >= 80) return '#10B981' // emerald
  if (score >= 60) return '#2563EB' // blue
  if (score >= 40) return '#F59E0B' // gold
  if (score >= 20) return '#F97316' // orange
  return '#EF4444'                  // red
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score)
  const offset = CIRCUMFERENCE * (1 - score / 100)
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90 absolute inset-0">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-[var(--color-navy)]">{score}</span>
        <span className="text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  )
}

function BlurredRing({ score }: { score: number }) {
  const color = scoreColor(score)
  const offset = CIRCUMFERENCE * (1 - score / 100)
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      {/* Blurred actual ring */}
      <div style={{ filter: 'blur(6px)', opacity: 0.7 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90 absolute inset-0">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-[var(--color-navy)]">{score}</span>
          <span className="text-[10px] font-semibold text-[var(--color-slate)] uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-full p-2 shadow-md">
          <Lock size={18} className="text-[var(--color-navy)]" />
        </div>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function FeasibilitySection({
  score,
  isPaid,
  analysisId,
}: {
  score: FeasibilityScore
  isPaid: boolean
  analysisId: string
}) {
  const color = scoreColor(score.overall_score)

  return (
    <div className="space-y-4">

      {/* Score Header */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-navy)] text-white rounded-xl p-2">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-[var(--color-navy)]">Feasibility Score</h3>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            Data Analysis
          </span>
        </div>

        {isPaid ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <ScoreRing score={score.overall_score} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-lg font-extrabold mb-1" style={{ color }}>
                {score.label}
              </div>
              <p className="text-sm text-[var(--color-slate)] leading-relaxed mb-4">
                {score.summary}
              </p>
              <RecalculateButton analysisId={analysisId} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <BlurredRing score={score.overall_score} />
            <div className="flex-1 text-center sm:text-left">
              <div className="font-bold text-[var(--color-navy)] mb-1">
                Your business has been scored
              </div>
              <p className="text-sm text-[var(--color-slate)] mb-4 leading-relaxed">
                Unlock your full feasibility score, pillar breakdown, and personalized next steps.
              </p>
              <Link
                href="/sign-up?plan=monthly"
                className="inline-block bg-[var(--color-navy)] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[var(--color-navy-light)] transition-colors"
              >
                Unlock Full Report — $29/mo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Paid: Pillar Breakdown */}
      {isPaid && (
        <>
          <PillarCarousel pillars={score.pillars} />

          {/* What's Working / Needs Attention */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-[var(--color-emerald)]" />
                <h4 className="font-bold text-sm text-[var(--color-emerald)]">What&apos;s Working</h4>
              </div>
              <ul className="space-y-2.5">
                {score.whats_working.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                    <CheckCircle size={13} className="text-[var(--color-emerald)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-[var(--color-gold)]" />
                <h4 className="font-bold text-sm text-[var(--color-gold)]">Needs Attention</h4>
              </div>
              <ul className="space-y-2.5">
                {score.needs_attention.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                    <AlertTriangle size={13} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-[var(--color-navy)] text-white rounded-xl p-2">
                <Lightbulb size={16} />
              </div>
              <h3 className="font-bold text-[var(--color-navy)]">Your Next Steps</h3>
            </div>
            <div className="space-y-3">
              {score.next_steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 bg-[var(--color-muted)] rounded-xl"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-white"
                    style={{ backgroundColor: color }}
                  >
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm text-[var(--color-foreground)]">{step}</p>
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 cursor-pointer shrink-0 accent-[var(--color-navy)]"
                  />
                </div>
              ))}
              {/* Advisor consultation — coming soon, easy to remove */}
              <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-muted)] rounded-xl opacity-60">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-white bg-[var(--color-slate)]">
                  {score.next_steps.length + 1}
                </div>
                <p className="flex-1 text-sm text-[var(--color-slate)] italic">
                  Book a Neur advisor consultation for a personalized strategy session{' '}
                  <span className="not-italic text-[10px] font-semibold bg-[var(--color-border)] text-[var(--color-slate)] px-1.5 py-0.5 rounded ml-1">
                    Coming Soon
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Disclaimer — always visible */}
      <p className="text-[11px] text-[var(--color-slate)] leading-relaxed px-1">
        This feasibility score is generated from publicly available data sources including the U.S. Census Bureau,
        Bureau of Labor Statistics, and Google Places. It is intended for informational purposes only and does not
        constitute financial, legal, or business advice. Scores are based on available data at the time of report
        generation and may not reflect current market conditions. Neur does not guarantee business success.
      </p>

    </div>
  )
}
