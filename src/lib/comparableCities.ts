// Comparable Cities Engine
// Finds cities with similar demographics to the user's chosen city.
// Uses weighted Euclidean distance across 5 normalized variables.

import { supabaseAdmin } from './supabase-admin'
import type { CensusData } from './api'

export interface ComparableCity {
  city: string
  state: string
  state_abbr: string
  similarity: number          // 0–100
  population: number | null
  median_household_income: number | null
  median_age: number | null
  unemployment_rate: number | null
  median_rent: number | null
  bachelor_degree_pct: number | null
  renter_pct: number | null
  hispanic_pct: number | null
  white_pct: number | null
  black_pct: number | null
  asian_pct: number | null
  latitude: number | null
  longitude: number | null
  shared_facts: string[]
}

// ─── Parse Census formatted strings ──────────────────────────────────────────
// CensusData returns strings like "$73,035" or "4.2%" or "34.1"

function parseIncome(s: string | undefined): number | null {
  if (!s) return null
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

function parseFloat2(s: string | undefined): number | null {
  if (!s) return null
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

// ─── Normalize a value within a min–max range ─────────────────────────────────
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0
  return (value - min) / (max - min)
}

// ─── Weights must sum to 1 ────────────────────────────────────────────────────
const WEIGHTS = {
  income:          0.30,
  age:             0.20,
  unemployment:    0.20,
  bachelor_pct:    0.15,
  renter_pct:      0.15,
}

// ─── Generate 2–3 plain-English shared facts ──────────────────────────────────
function buildSharedFacts(
  userIncome: number | null,
  userAge: number | null,
  userUnemp: number | null,
  city: ComparableCity,
): string[] {
  const facts: string[] = []

  if (userIncome && city.median_household_income) {
    const diff = Math.abs(userIncome - city.median_household_income)
    if (diff < 5000) {
      facts.push(`Similar median household income (~$${Math.round(city.median_household_income / 1000)}k)`)
    }
  }

  if (userAge && city.median_age) {
    const diff = Math.abs(userAge - city.median_age)
    if (diff < 3) {
      facts.push(`Comparable median age (~${city.median_age} yrs)`)
    }
  }

  if (userUnemp && city.unemployment_rate) {
    const diff = Math.abs(userUnemp - city.unemployment_rate)
    if (diff < 1) {
      facts.push(`Similar unemployment rate (~${city.unemployment_rate}%)`)
    }
  }

  if (city.bachelor_degree_pct) {
    if (city.bachelor_degree_pct >= 35) {
      facts.push(`Highly educated workforce (${city.bachelor_degree_pct.toFixed(0)}% bachelor's+)`)
    } else if (city.bachelor_degree_pct >= 20) {
      facts.push(`Moderate college attainment (${city.bachelor_degree_pct.toFixed(0)}% bachelor's+)`)
    }
  }

  if (city.renter_pct) {
    if (city.renter_pct >= 50) {
      facts.push(`Renter-majority market (${city.renter_pct.toFixed(0)}% renters)`)
    }
  }

  // Always return at least 1 fact
  if (facts.length === 0) {
    facts.push(`Demographically aligned with your target market`)
  }

  return facts.slice(0, 3)
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function findComparableCities(
  censusData: CensusData,
  userCity: string,
  userState: string,
): Promise<ComparableCity[] | null> {
  // Parse user's demographic values from Census API strings
  const userIncome     = parseIncome(censusData.medianHouseholdIncome)
  const userAge        = parseFloat2(censusData.medianAge)
  const userUnemp      = parseFloat2(censusData.unemploymentRate)

  // Need at least income + age to produce meaningful results
  if (!userIncome || !userAge) return null

  // Fetch all cities from Supabase (excluding user's own city)
  const { data: cities, error } = await supabaseAdmin
    .from('cities')
    .select('city, state, state_abbr, population, median_household_income, median_age, unemployment_rate, median_rent, bachelor_degree_pct, renter_pct, hispanic_pct, white_pct, black_pct, asian_pct, latitude, longitude')
    .not('median_household_income', 'is', null)
    .not('median_age', 'is', null)
    .not('unemployment_rate', 'is', null)

  if (error || !cities || cities.length === 0) return null

  // Exclude user's own city (case-insensitive)
  const candidates = cities.filter(
    c => !(c.city.toLowerCase() === userCity.toLowerCase() && c.state.toLowerCase() === userState.toLowerCase())
  )

  if (candidates.length < 3) return null

  // Build min/max for normalization across all candidates + user
  const allIncome      = [userIncome,   ...candidates.map(c => c.median_household_income).filter(Boolean)] as number[]
  const allAge         = [userAge,      ...candidates.map(c => c.median_age).filter(Boolean)] as number[]
  const allUnemp       = [userUnemp ?? 0, ...candidates.map(c => c.unemployment_rate).filter(Boolean)] as number[]
  const allBachelor    = candidates.map(c => c.bachelor_degree_pct).filter(Boolean) as number[]
  const allRenter      = candidates.map(c => c.renter_pct).filter(Boolean) as number[]

  const ranges = {
    income:       { min: Math.min(...allIncome),   max: Math.max(...allIncome) },
    age:          { min: Math.min(...allAge),       max: Math.max(...allAge) },
    unemployment: { min: Math.min(...allUnemp),     max: Math.max(...allUnemp) },
    bachelor:     { min: allBachelor.length ? Math.min(...allBachelor) : 0, max: allBachelor.length ? Math.max(...allBachelor) : 1 },
    renter:       { min: allRenter.length ? Math.min(...allRenter) : 0,     max: allRenter.length ? Math.max(...allRenter) : 1 },
  }

  // Normalized user values
  const uIncome    = normalize(userIncome, ranges.income.min, ranges.income.max)
  const uAge       = normalize(userAge,    ranges.age.min,    ranges.age.max)
  const uUnemp     = normalize(userUnemp ?? 0, ranges.unemployment.min, ranges.unemployment.max)

  // Score each candidate
  const scored = candidates.map(c => {
    const cIncome   = c.median_household_income != null ? normalize(c.median_household_income, ranges.income.min, ranges.income.max) : null
    const cAge      = c.median_age != null              ? normalize(c.median_age,    ranges.age.min, ranges.age.max)         : null
    const cUnemp    = c.unemployment_rate != null       ? normalize(c.unemployment_rate, ranges.unemployment.min, ranges.unemployment.max) : null
    const cBachelor = c.bachelor_degree_pct != null     ? normalize(c.bachelor_degree_pct, ranges.bachelor.min, ranges.bachelor.max)       : null
    const cRenter   = c.renter_pct != null              ? normalize(c.renter_pct,    ranges.renter.min, ranges.renter.max)   : null

    let weightedDist = 0
    let totalWeight = 0

    if (cIncome != null)   { weightedDist += WEIGHTS.income       * Math.pow(uIncome - cIncome, 2);   totalWeight += WEIGHTS.income }
    if (cAge != null)      { weightedDist += WEIGHTS.age          * Math.pow(uAge - cAge, 2);          totalWeight += WEIGHTS.age }
    if (cUnemp != null)    { weightedDist += WEIGHTS.unemployment  * Math.pow(uUnemp - cUnemp, 2);     totalWeight += WEIGHTS.unemployment }
    if (cBachelor != null) { weightedDist += WEIGHTS.bachelor_pct  * Math.pow(0.5 - cBachelor, 2);    totalWeight += WEIGHTS.bachelor_pct }
    if (cRenter != null)   { weightedDist += WEIGHTS.renter_pct    * Math.pow(0.5 - cRenter, 2);      totalWeight += WEIGHTS.renter_pct }

    if (totalWeight === 0) return null

    // Normalize distance to 0–1, then convert to similarity %
    const normalizedDist = Math.sqrt(weightedDist / totalWeight)
    const similarity = Math.round(Math.max(0, (1 - normalizedDist)) * 100)

    const cityResult: ComparableCity = {
      city: c.city,
      state: c.state,
      state_abbr: c.state_abbr,
      similarity,
      population: c.population,
      median_household_income: c.median_household_income,
      median_age: c.median_age,
      unemployment_rate: c.unemployment_rate,
      median_rent: c.median_rent,
      bachelor_degree_pct: c.bachelor_degree_pct,
      renter_pct: c.renter_pct,
      hispanic_pct: c.hispanic_pct,
      white_pct: c.white_pct,
      black_pct: c.black_pct,
      asian_pct: c.asian_pct,
      latitude: c.latitude,
      longitude: c.longitude,
      shared_facts: [],
    }

    cityResult.shared_facts = buildSharedFacts(userIncome, userAge, userUnemp, cityResult)
    return cityResult
  }).filter((c): c is ComparableCity => c !== null)

  // Sort by similarity descending, return top 5
  scored.sort((a, b) => b.similarity - a.similarity)
  return scored.slice(0, 5)
}
