'use client'

import { useState } from 'react'
import type { ComparableCity } from '@/lib/comparableCities'
import { MapPin, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

// ─── Similarity badge color ────────────────────────────────────────────────────

function badgeStyle(similarity: number): { bg: string; text: string; label: string } {
  if (similarity >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Very Similar' }
  if (similarity >= 70) return { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Similar' }
  if (similarity >= 55) return { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Somewhat Similar' }
  return                       { bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Loosely Similar' }
}

// ─── Single city card ─────────────────────────────────────────────────────────

function CityCard({ city, industry }: { city: ComparableCity; industry: string }) {
  const badge = badgeStyle(city.similarity)

  const rows: { label: string; value: string | null }[] = [
    { label: 'Median Income',    value: city.median_household_income ? `$${city.median_household_income.toLocaleString()}` : null },
    { label: 'Median Age',       value: city.median_age ? `${city.median_age} yrs` : null },
    { label: 'Unemployment',     value: city.unemployment_rate ? `${city.unemployment_rate}%` : null },
    { label: "Bachelor's+",      value: city.bachelor_degree_pct ? `${city.bachelor_degree_pct.toFixed(0)}%` : null },
    { label: 'Renters',          value: city.renter_pct ? `${city.renter_pct.toFixed(0)}%` : null },
  ].filter(r => r.value !== null)

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold text-[var(--color-navy)] text-base leading-tight">{city.city}</div>
          <div className="text-xs text-[var(--color-slate)] mt-0.5">{city.state}</div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
          {city.similarity}% match
        </div>
      </div>

      {/* Shared facts */}
      {city.shared_facts.length > 0 && (
        <ul className="space-y-1.5">
          {city.shared_facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-foreground)]">
              <TrendingUp size={11} className="text-[var(--color-navy)] shrink-0 mt-0.5" />
              {fact}
            </li>
          ))}
        </ul>
      )}

      {/* Demographics mini-table */}
      {rows.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between items-baseline text-[11px]">
              <span className="text-[var(--color-slate)]">{r.label}</span>
              <span className="font-semibold text-[var(--color-navy)]">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Explore on Map */}
      {city.latitude && city.longitude && (
        <Link
          href={`/dashboard/map?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}&industry=${encodeURIComponent(industry)}`}
          className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] hover:underline"
        >
          <MapPin size={11} /> Explore on Map
        </Link>
      )}
    </div>
  )
}

// ─── Main export (client for show-more toggle) ────────────────────────────────

export default function ComparableCitiesSection({
  cities,
  industry,
}: {
  cities: ComparableCity[]
  industry: string
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? cities : cities.slice(0, 3)
  const remaining = cities.length - 3

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-navy)] text-white rounded-xl p-2">
            <Users size={16} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-navy)]">Comparable Cities</h3>
            <p className="text-xs text-[var(--color-slate)] mt-0.5">
              Cities with similar demographics to your target market
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          Census Data
        </span>
      </div>

      {/* City cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(city => (
          <CityCard key={`${city.city}-${city.state}`} city={city} industry={industry} />
        ))}
      </div>

      {/* Show more */}
      {!showAll && remaining > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full text-sm text-[var(--color-slate)] hover:text-[var(--color-navy)] font-medium transition-colors"
        >
          Show {remaining} more {remaining === 1 ? 'city' : 'cities'} →
        </button>
      )}

      {/* Tip */}
      <div className="mt-4 flex items-start gap-2 bg-[var(--color-muted)] rounded-xl px-4 py-3 text-xs text-[var(--color-slate)]">
        <DollarSign size={12} className="shrink-0 mt-0.5 text-[var(--color-navy)]" />
        <span>
          These cities have similar income levels, age distribution, and workforce profiles to {industry ? `your ${industry} target market` : 'your target market'}.
          Use them to benchmark pricing, study competitors, or consider expansion.
        </span>
      </div>
    </div>
  )
}
