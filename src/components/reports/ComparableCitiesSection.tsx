'use client'

import { useState } from 'react'
import type { ComparableCity } from '@/lib/comparableCities'
import { MapPin, TrendingUp, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

// ─── UserCity shape passed from report page ───────────────────────────────────

export interface UserCityData {
  name: string
  median_household_income: number | null
  median_age: number | null
  unemployment_rate: number | null
  median_rent: number | null
  bachelor_degree_pct: number | null
  renter_pct: number | null
}

// ─── Similarity badge color ────────────────────────────────────────────────────

function badgeStyle(similarity: number): { bg: string; text: string } {
  if (similarity >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
  if (similarity >= 70) return { bg: 'bg-blue-100',    text: 'text-blue-700' }
  if (similarity >= 55) return { bg: 'bg-amber-100',   text: 'text-amber-700' }
  return                       { bg: 'bg-slate-100',   text: 'text-slate-600' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null, type: 'income' | 'age' | 'pct' | 'rent'): string {
  if (val === null || val === undefined) return 'N/A'
  switch (type) {
    case 'income': return `$${val.toLocaleString()}`
    case 'age':    return `${val} yrs`
    case 'pct':    return `${val}%`
    case 'rent':   return `$${val.toLocaleString()}/mo`
  }
}

// ─── Single city card ─────────────────────────────────────────────────────────

function CityCard({
  city,
  industry,
  userCity,
  isExpanded,
  onToggle,
}: {
  city: ComparableCity
  industry: string
  userCity: UserCityData
  isExpanded: boolean
  onToggle: () => void
}) {
  const badge = badgeStyle(city.similarity)

  // Collapsed demographics mini-table — identical to before
  const rows: { label: string; value: string | null }[] = [
    { label: 'Median Income',  value: city.median_household_income ? `$${city.median_household_income.toLocaleString()}` : null },
    { label: 'Median Age',     value: city.median_age ? `${city.median_age} yrs` : null },
    { label: 'Unemployment',   value: city.unemployment_rate ? `${city.unemployment_rate}%` : null },
    { label: "Bachelor's+",    value: city.bachelor_degree_pct ? `${city.bachelor_degree_pct.toFixed(0)}%` : null },
    { label: 'Renters',        value: city.renter_pct ? `${city.renter_pct.toFixed(0)}%` : null },
  ].filter(r => r.value !== null)

  // Comparison table rows
  const comparisonRows: { label: string; userVal: string; cityVal: string }[] = [
    { label: 'Median Income',     userVal: fmt(userCity.median_household_income, 'income'), cityVal: fmt(city.median_household_income, 'income') },
    { label: 'Median Age',        userVal: fmt(userCity.median_age, 'age'),                  cityVal: fmt(city.median_age, 'age') },
    { label: 'Unemployment',      userVal: fmt(userCity.unemployment_rate, 'pct'),            cityVal: fmt(city.unemployment_rate, 'pct') },
    { label: 'Median Rent',       userVal: fmt(userCity.median_rent, 'rent'),                 cityVal: fmt(city.median_rent !== null ? city.median_rent : null, 'rent') },
    { label: 'College Educated',  userVal: fmt(userCity.bachelor_degree_pct, 'pct'),          cityVal: fmt(city.bachelor_degree_pct, 'pct') },
    { label: 'Renters',           userVal: fmt(userCity.renter_pct, 'pct'),                   cityVal: fmt(city.renter_pct, 'pct') },
  ]

  // Community profile
  const hasEthnicity = city.hispanic_pct != null || city.white_pct != null || city.black_pct != null || city.asian_pct != null
  const ethnicSum = (city.hispanic_pct ?? 0) + (city.white_pct ?? 0) + (city.black_pct ?? 0) + (city.asian_pct ?? 0)
  const other = parseFloat((100 - ethnicSum).toFixed(1))

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex flex-col gap-4">
      {/* Header — unchanged */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold text-[var(--color-navy)] text-base leading-tight">{city.city}</div>
          <div className="text-xs text-[var(--color-slate)] mt-0.5">{city.state}</div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
          {city.similarity}% match
        </div>
      </div>

      {/* Shared facts — unchanged */}
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

      {/* Demographics mini-table — unchanged */}
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

      {/* Explore on Map — unchanged */}
      {city.latitude && city.longitude && (
        <Link
          href={`/dashboard/map?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}&industry=${encodeURIComponent(industry)}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] hover:underline"
        >
          <MapPin size={11} /> Explore on Map
        </Link>
      )}

      {/* ── Expanded content ───────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-4">

          {/* Section A — Full Comparison Table */}
          <div>
            <div className="text-[11px] font-bold text-[var(--color-navy)] uppercase tracking-wide mb-2">
              Side-by-Side Comparison
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  <th className="text-left text-[var(--color-slate)] font-medium pb-1.5 w-[40%]">Metric</th>
                  <th className="text-right text-[var(--color-navy)] font-bold pb-1.5 pr-2">
                    {userCity.name ?? 'Your City'}
                  </th>
                  <th className="text-right text-[var(--color-slate)] font-semibold pb-1.5">
                    {city.city}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(r => (
                  <tr key={r.label} className="border-t border-[var(--color-border)]">
                    <td className="text-[var(--color-slate)] py-1.5">{r.label}</td>
                    <td className="text-right text-[var(--color-navy)] font-semibold py-1.5 pr-2">{r.userVal}</td>
                    <td className="text-right text-[var(--color-slate)] py-1.5">{r.cityVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section B — Community Profile */}
          {hasEthnicity && (
            <div>
              <div className="text-[11px] font-bold text-[var(--color-navy)] uppercase tracking-wide mb-2">
                Community Profile — {city.city}
              </div>
              <ul className="space-y-1.5 mb-3">
                {city.hispanic_pct != null && (
                  <li className="flex justify-between text-[11px]">
                    <span className="text-[var(--color-slate)]">Hispanic or Latino</span>
                    <span className="font-semibold text-[var(--color-navy)]">{city.hispanic_pct.toFixed(1)}%</span>
                  </li>
                )}
                {city.white_pct != null && (
                  <li className="flex justify-between text-[11px]">
                    <span className="text-[var(--color-slate)]">White (non-Hispanic)</span>
                    <span className="font-semibold text-[var(--color-navy)]">{city.white_pct.toFixed(1)}%</span>
                  </li>
                )}
                {city.black_pct != null && (
                  <li className="flex justify-between text-[11px]">
                    <span className="text-[var(--color-slate)]">Black or African American</span>
                    <span className="font-semibold text-[var(--color-navy)]">{city.black_pct.toFixed(1)}%</span>
                  </li>
                )}
                {city.asian_pct != null && (
                  <li className="flex justify-between text-[11px]">
                    <span className="text-[var(--color-slate)]">Asian</span>
                    <span className="font-semibold text-[var(--color-navy)]">{city.asian_pct.toFixed(1)}%</span>
                  </li>
                )}
                {other > 0 && (
                  <li className="flex justify-between text-[11px]">
                    <span className="text-[var(--color-slate)]">Other</span>
                    <span className="font-semibold text-[var(--color-navy)]">{other.toFixed(1)}%</span>
                  </li>
                )}
              </ul>
              <p className="text-[10px] text-[var(--color-slate)] leading-relaxed italic">
                Community profile data is provided for informational context only and is not used to generate recommendations or scores.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expand / Collapse trigger */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-1 text-xs text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors mt-auto pt-1 border-t border-[var(--color-border)]"
      >
        {isExpanded ? (
          <><ChevronUp size={13} /> Collapse</>
        ) : (
          <><ChevronDown size={13} /> Explore Details</>
        )}
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ComparableCitiesSection({
  cities,
  industry,
  userCity,
}: {
  cities: ComparableCity[]
  industry: string
  userCity: UserCityData
}) {
  const [showAll, setShowAll] = useState(false)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const visible = showAll ? cities : cities.slice(0, 3)
  const remaining = cities.length - 3

  function handleToggle(key: string) {
    setExpandedKey(prev => (prev === key ? null : key))
  }

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
        {visible.map(city => {
          const key = `${city.city}-${city.state}`
          return (
            <CityCard
              key={key}
              city={city}
              industry={industry}
              userCity={userCity}
              isExpanded={expandedKey === key}
              onToggle={() => handleToggle(key)}
            />
          )
        })}
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
          These cities share similar income levels, age distribution, and workforce profiles to your target market.
          Expand any city to compare demographics side by side and explore the community profile.
        </span>
      </div>
    </div>
  )
}
