// Shared server-side API helpers for report and other server components.
// All functions are safe to call from Next.js Server Components and Route Handlers.

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export interface CensusData {
  areaName: string
  population: string
  medianHouseholdIncome: string
  medianAge: string
  unemploymentRate: string
  medianRent: string
  bachelorsDegreeCount: string
  error?: string
}

export interface BLSData {
  industry: string
  sectorLabel: string
  latestEmployment: string
  employmentTrend: string
  nationalUnemploymentRate: string
  avgHourlyEarnings: string
  avgWeeklyHours: string
  employmentHistory: { period: string; value: number }[]
  error?: string
}

export interface PlaceResult {
  id: string
  name: string
  rating: number | null
  totalRatings: number
  types: string[]
}

export async function fetchCensusData(state: string, city?: string): Promise<CensusData | null> {
  try {
    const base = getBaseUrl()
    const url = city
      ? `${base}/api/census?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
      : `${base}/api/census?state=${encodeURIComponent(state)}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    return await res.json()
  } catch { return null }
}

export async function fetchBLSData(industry: string): Promise<BLSData | null> {
  try {
    const base = getBaseUrl()
    const res = await fetch(`${base}/api/bls?industry=${encodeURIComponent(industry)}`, { next: { revalidate: 86400 } })
    return await res.json()
  } catch { return null }
}

export async function fetchGeocode(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const base = getBaseUrl()
    const res = await fetch(
      `${base}/api/geocode?address=${encodeURIComponent(`${city}, ${state}`)}`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()
    if (data.lat) return { lat: data.lat, lng: data.lng }
    return null
  } catch { return null }
}

export async function fetchPlaces(
  lat: number,
  lng: number,
  industry: string,
  radiusMeters = 8047
): Promise<{ places: PlaceResult[] } | null> {
  try {
    const base = getBaseUrl()
    const res = await fetch(
      `${base}/api/places?lat=${lat}&lng=${lng}&radius=${radiusMeters}&industry=${encodeURIComponent(industry)}`,
      { next: { revalidate: 3600 } }
    )
    return await res.json()
  } catch { return null }
}
