import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Census Bureau ACS 5-Year Estimates
// Mode 1 — ?city=Austin&state=Texas  → query ACS place-level data directly (no geocoding needed)
// Mode 2 — ?lat=30.2&lng=-97.7       → county FIPS → county ACS data (used by map)
// Mode 3 — ?state=Texas              → state-level ACS data (fallback)
//
// Variables:
//   B01003_001E — Total population
//   B19013_001E — Median household income
//   B01002_001E — Median age
//   B23025_004E — Employed civilian population
//   B23025_005E — Unemployed civilian population
//   B25058_001E — Median contract rent
//   B15003_022E — Bachelor's degree holders

const CENSUS_BASE = 'https://api.census.gov/data/2022/acs/acs5'
const GEOCODER_BASE = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates'
const KEY = process.env.CENSUS_API_KEY

const STATE_FIPS: Record<string, string> = {
  'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05',
  'California': '06', 'Colorado': '08', 'Connecticut': '09', 'Delaware': '10',
  'Florida': '12', 'Georgia': '13', 'Hawaii': '15', 'Idaho': '16',
  'Illinois': '17', 'Indiana': '18', 'Iowa': '19', 'Kansas': '20',
  'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
  'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28',
  'Missouri': '29', 'Montana': '30', 'Nebraska': '31', 'Nevada': '32',
  'New Hampshire': '33', 'New Jersey': '34', 'New Mexico': '35', 'New York': '36',
  'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39', 'Oklahoma': '40',
  'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
  'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49',
  'Vermont': '50', 'Virginia': '51', 'Washington': '53', 'West Virginia': '54',
  'Wisconsin': '55', 'Wyoming': '56',
}

const VARIABLES = [
  'B01003_001E', // Total population
  'B19013_001E', // Median household income
  'B01002_001E', // Median age
  'B23025_004E', // Employed
  'B23025_005E', // Unemployed
  'B25058_001E', // Median rent
  'B15003_022E', // Bachelor's degree
].join(',')

function formatResult(data: Record<string, string>, areaName: string) {
  const population = parseInt(data['B01003_001E'])
  const employed = parseInt(data['B23025_004E'])
  const unemployed = parseInt(data['B23025_005E'])
  const laborForce = employed + unemployed
  const unemploymentRate = laborForce > 0
    ? ((unemployed / laborForce) * 100).toFixed(1)
    : null

  return {
    areaName,
    population: population.toLocaleString(),
    medianHouseholdIncome: parseInt(data['B19013_001E']).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    medianAge: data['B01002_001E'],
    unemploymentRate: unemploymentRate ? `${unemploymentRate}%` : 'N/A',
    medianRent: parseInt(data['B25058_001E']).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    bachelorsDegreeCount: parseInt(data['B15003_022E']).toLocaleString(),
  }
}

async function coordsToCountyACS(lat: string, lng: string) {
  const geoUrl = `${GEOCODER_BASE}?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Vintages&layers=Counties&format=json`
  const geoRes = await fetch(geoUrl, { next: { revalidate: 3600 } })
  const geoData = await geoRes.json()

  const county = geoData?.result?.geographies?.Counties?.[0]
  if (!county) throw new Error('Could not find county for coordinates')

  const stateFips = county.STATE
  const countyFips = county.COUNTY
  const countyName = county.NAME

  const url = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=county:${countyFips}&in=state:${stateFips}&key=${KEY}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Census API error: ${res.status}`)

  const raw: string[][] = await res.json()
  const headers = raw[0]
  const values = raw[1]
  const data: Record<string, string> = {}
  headers.forEach((h, i) => { data[h] = values[i] })

  return formatResult(data, countyName)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const city = searchParams.get('city')
  const state = searchParams.get('state')

  try {
    // ── Mode 1: city + state → ACS place-level data (no geocoding needed) ───
    if (city && state) {
      const fips = STATE_FIPS[state]
      if (!fips) return NextResponse.json({ error: `Unknown state: ${state}` }, { status: 400 })

      // Fetch ACS data for all incorporated places in the state, then find the city
      // Census NAME format: "Austin city, Texas" or "San Antonio city, Texas"
      const url = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=place:*&in=state:${fips}&key=${KEY}`
      const res = await fetch(url, { next: { revalidate: 86400 } })
      if (!res.ok) throw new Error(`Census API error: ${res.status}`)

      const raw: string[][] = await res.json()
      const headers = raw[0]
      const cityLower = city.toLowerCase()

      // Match "Austin city, Texas" or "Austin town, Texas" etc.
      const matchRow = raw.slice(1).find(row =>
        row[0].toLowerCase().startsWith(cityLower + ' ')
      )

      if (!matchRow) {
        // City not found as a Census place — fall back to state level
        const stateUrl = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=state:${fips}&key=${KEY}`
        const stateRes = await fetch(stateUrl, { next: { revalidate: 86400 } })
        if (!stateRes.ok) throw new Error(`Census API error: ${stateRes.status}`)
        const stateRaw: string[][] = await stateRes.json()
        const stateHeaders = stateRaw[0]
        const stateData: Record<string, string> = {}
        stateHeaders.forEach((h, i) => { stateData[h] = stateRaw[1][i] })
        return NextResponse.json(formatResult(stateData, state))
      }

      const data: Record<string, string> = {}
      headers.forEach((h, i) => { data[h] = matchRow[i] })
      // areaName: use "Austin, Texas" format
      return NextResponse.json(formatResult(data, `${city}, ${state}`))
    }

    // ── Mode 2: lat/lng → county ACS (used by map) ────────────────────────────
    if (lat && lng) {
      const result = await coordsToCountyACS(lat, lng)
      return NextResponse.json(result)
    }

    // ── State-level fallback ──────────────────────────────────────────────────
    if (state) {
      const fips = STATE_FIPS[state]
      if (!fips) return NextResponse.json({ error: `Unknown state: ${state}` }, { status: 400 })

      const url = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=state:${fips}&key=${KEY}`
      const res = await fetch(url, { next: { revalidate: 86400 } })
      if (!res.ok) throw new Error(`Census API error: ${res.status}`)

      const raw: string[][] = await res.json()
      const headers = raw[0]
      const values = raw[1]
      const data: Record<string, string> = {}
      headers.forEach((h, i) => { data[h] = values[i] })

      return NextResponse.json(formatResult(data, state))
    }

    return NextResponse.json({ error: 'lat/lng or state parameter required' }, { status: 400 })

  } catch (err) {
    console.error('Census API error:', err)
    return NextResponse.json({ error: 'Failed to fetch Census data' }, { status: 500 })
  }
}
