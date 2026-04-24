'use client'

import { useState } from 'react'
import type { ComparableCity } from '@/lib/comparableCities'
import { MapPin, TrendingUp, Users, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export interface UserCityData {
  name: string
  median_household_income: number | null
  median_age: number | null
  unemployment_rate: number | null
  median_rent: number | null
  bachelor_degree_pct: number | null
  renter_pct: number | null
}

function badgeStyle(similarity: number): { bg: string; text: string } {
  if (similarity >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
  if (similarity >= 70) return { bg: 'bg-blue-100',    text: 'text-blue-700' }
  if (similarity >= 55) return { bg: 'bg-amber-100',   text: 'text-amber-700' }
  return                       { bg: 'bg-slate-100',   text: 'text-slate-600' }
}

function fmt(val: number | null, type: 'income' | 'age' | 'pct' | 'rent'): string {
  if (val === null || val === undefined) return 'N/A'
  switch (type) {
    case 'income': return `$${val.toLocaleString()}`
    case 'age':    return `${val} yrs`
    case 'pct':    return `${val}%`
    case 'rent':   return `$${val.toLocaleString()}/mo`
  }
}

function CityCard({
  city,
  industry,
  userCity,
}: {
  city: ComparableCity
  industry: string
  userCity: UserCityData
}) {
  const [expanded, setExpanded] = useState(false)
  const badge = badgeStyle(city.similarity)

  const rows: { label: string; value: string | null }[] = [
    { label: 'Median Income',  value: city.median_household_income ? `$${city.median_household_income.toLocaleString()}` : null },
    { label: 'Median Age',     value: city.median_age ? `${city.median_age} yrs` : null },
    { label: 'Unemployment',   value: city.unemployment_rate ? `${city.unemployment_rate}%` : null },
    { label: "Bachelor's+",    value: city.bachelor_degree_pct ? `${city.bachelor_degree_pct.toFixed(0)}%` : null },
    { label: 'Renters',        value: city.renter_pct ? `${city.renter_pct.toFixed(0)}%` : null },
  ].filter(r => r.value !== null)

  const comparisonRows: { label: string; userVal: string; cityVal: string }[] = [
    { label: 'Median Income',    userVal: fmt(userCity.median_household_income, 'income'), cityVal: fmt(city.median_household_income, 'income') },
    { label: 'Median Age',       userVal: fmt(userCity.median_age, 'age'),                  cityVal: fmt(city.median_age, 'age') },
    { label: 'Unemployment',     userVal: fmt(userCity.unemployment_rate, 'pct'),            cityVal: fmt(city.unemployment_rate, 'pct') },
    { label: 'Median Rent',      userVal: fmt(userCity.median_rent, 'rent'),                 cityVal: fmt(city.median_rent, 'rent') },
    { label: 'College Educated', userVal: fmt(userCity.bachelor_degree_pct, 'pct'),          cityVal: fmt(city.bachelor_degree_pct, 'pct') },
    { label: 'Renters',          userVal: fmt(userCity.renter_pct, 'pct'),                   cityVal: fmt(city.renter_pct, 'pct') },
  ]

  const hasEthnicity = city.hispanic_pct != null || city.white_pct != null || city.black_pct != null || city.asian_pct != null
  const ethnicSum = (city.hispanic_pct ?? 0) + (city.white_pct ?? 0) + (city.black_pct ?? 0) + (city.asian_pct ?? 0)
  const other = parseFloat((100 - ethnicSum).toFixed(1))

  return (
    <div className="flex flex-col gap-4">

      {/* City name + similarity badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold text-[var(--color-navy)] text-lg leading-tight">{city.city}</div>
          <div className="text-sm text-[var(--color-slate)] mt-0.5">{city.state}</div>
        </div>
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
          {city.similarity}% match
        </div>
      </div>

      {/* Shared facts */}
      {city.shared_facts.length > 0 && (
        <ul className="space-y-2">
          {city.shared_facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
              <TrendingUp size={12} className="text-[var(--color-navy)] shrink-0 mt-0.5" />
              {fact}
            </li>
          ))}
        </ul>
      )}

      {/* Demographics mini-table */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between items-baseline text-xs">
              <span className="text-[var(--color-slate)]">{r.label}</span>
              <span className="font-semibold text-[var(--color-navy)]">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Explore on map */}
      {city.latitude && city.longitude && (
        <Link
          href={`/dashboard/map?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}&industry=${encodeURIComponent(industry)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] hover:underline"
        >
          <MapPin size={11} /> Explore on Map
        </Link>
      )}

      {/* Expand / collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors border-t border-[var(--color-border)] pt-3"
      >
        {expanded ? <><ChevronUp size={13} /> Hide details</> : <><ChevronDown size={13} /> Side-by-side comparison + community profile</>}
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-4">

          {/* Side-by-side table */}
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

          {/* Community profile */}
          {hasEthnicity && (
            <div>
              <div className="text-[11px] font-bold text-[var(--color-navy)] uppercase tracking-wide mb-2">
                Community Profile — {city.city}
              </div>
              <ul className="space-y-1.5">
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
              <p className="text-[10px] text-[var(--color-slate)] leading-relaxed italic mt-2">
                Community profile data is provided for informational context only and is not used to generate recommendations or scores.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComparableCitiesSection({
  cities,
  industry,
  userCity,
}: {
  cities: ComparableCity[]
  industry: string
  userCity: UserCityData
}) {
  const [index, setIndex] = useState(0)
  const total = cities.length

  function prev() { setIndex(i => (i - 1 + total) % total) }
  function next() { setIndex(i => (i + 1) % total) }

  const city = cities[index]

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

      {/* Section header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
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

      {/* City card body */}
      <div className="px-6 py-5 min-h-[220px]">
        <CityCard city={city} industry={industry} userCity={userCity} key={`${city.city}-${city.state}`} />
      </div>

      {/* Navigation footer */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)]"
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
          {cities.map((_, i) => (
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

      {/* Tip */}
      <div className="mx-6 mb-5 flex items-start gap-2 rounded-xl px-4 py-3 text-xs text-[var(--color-slate)]" style={{ background: '#F7F4EF' }}>
        <DollarSign size={12} className="shrink-0 mt-0.5 text-[var(--color-navy)]" />
        <span>
          These cities share similar income levels, age distribution, and workforce profiles to your target market.
          Expand any city to compare demographics side by side.
        </span>
      </div>

    </div>
  )
}
