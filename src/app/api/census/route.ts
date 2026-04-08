import { NextRequest, NextResponse } from 'next/server'

// Census Bureau ACS 5-Year Estimates
// Docs: https://www.census.gov/data/developers/data-sets/acs-5year.html
//
// Variables we fetch per state/county:
//   B01003_001E — Total population
//   B19013_001E — Median household income
//   B01002_001E — Median age
//   B23025_004E — Employed civilian population
//   B23025_005E — Unemployed civilian population
//   B25058_001E — Median contract rent
//   B15003_022E — Bachelor's degree holders (education proxy)
//   B01001_002E — Male population (for age breakdown)
//   B01001_026E — Female population

const CENSUS_BASE = 'https://api.census.gov/data/2022/acs/acs5'
const KEY = process.env.CENSUS_API_KEY

// Maps state names to FIPS codes
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')

  if (!state) {
    return NextResponse.json({ error: 'state parameter required' }, { status: 400 })
  }

  const fips = STATE_FIPS[state]
  if (!fips) {
    return NextResponse.json({ error: `Unknown state: ${state}` }, { status: 400 })
  }

  const variables = [
    'B01003_001E', // Total population
    'B19013_001E', // Median household income
    'B01002_001E', // Median age
    'B23025_004E', // Employed
    'B23025_005E', // Unemployed
    'B25058_001E', // Median rent
    'B15003_022E', // Bachelor's degree
  ].join(',')

  const url = `${CENSUS_BASE}?get=NAME,${variables}&for=state:${fips}&key=${KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h
    if (!res.ok) throw new Error(`Census API error: ${res.status}`)

    const raw: string[][] = await res.json()
    const headers = raw[0]
    const values = raw[1]

    const data: Record<string, string> = {}
    headers.forEach((h, i) => { data[h] = values[i] })

    const population = parseInt(data['B01003_001E'])
    const employed = parseInt(data['B23025_004E'])
    const unemployed = parseInt(data['B23025_005E'])
    const laborForce = employed + unemployed
    const unemploymentRate = laborForce > 0
      ? ((unemployed / laborForce) * 100).toFixed(1)
      : null

    return NextResponse.json({
      state,
      population: population.toLocaleString(),
      medianHouseholdIncome: parseInt(data['B19013_001E']).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      medianAge: data['B01002_001E'],
      unemploymentRate: unemploymentRate ? `${unemploymentRate}%` : 'N/A',
      medianRent: parseInt(data['B25058_001E']).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      bachelorsDegreeCount: parseInt(data['B15003_022E']).toLocaleString(),
    })
  } catch (err) {
    console.error('Census API error:', err)
    return NextResponse.json({ error: 'Failed to fetch Census data' }, { status: 500 })
  }
}
