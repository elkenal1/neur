// Populates hispanic_pct, white_pct, black_pct, asian_pct for all cities in the DB.
// Run after: ALTER TABLE cities ADD COLUMN IF NOT EXISTS hispanic_pct numeric, ...
// Usage: npx tsx scripts/populate-ethnicity.ts

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ─── Load .env.local manually ─────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CENSUS_KEY   = process.env.CENSUS_API_KEY ?? ''
const CENSUS_BASE  = 'https://api.census.gov/data/2022/acs/acs5'

// Variables: Hispanic, White non-Hispanic, Black, Asian, Total population
const VARIABLES = 'B03003_003E,B03002_003E,B03002_004E,B03002_006E,B01003_001E'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─── State FIPS codes ─────────────────────────────────────────────────────────
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  // Fetch all cities from DB
  const { data: cities, error } = await supabase
    .from('cities')
    .select('city, state, state_abbr')
    .order('state', { ascending: true })

  if (error || !cities) {
    console.error('Failed to fetch cities from Supabase:', error)
    process.exit(1)
  }

  console.log(`Starting ethnicity population — ${cities.length} cities\n`)

  // Group by state
  const byState = new Map<string, { city: string; state: string; state_abbr: string }[]>()
  for (const c of cities) {
    const list = byState.get(c.state) || []
    list.push(c)
    byState.set(c.state, list)
  }

  let totalUpdated = 0
  let totalSkipped = 0

  for (const [state, stateCities] of byState) {
    const fips = STATE_FIPS[state]
    if (!fips) {
      console.warn(`  Skipping ${state} — no FIPS code`)
      continue
    }

    console.log(`\nFetching ethnicity data for ${state} (${stateCities.length} cities)...`)

    let res: Response | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const url = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=place:*&in=state:${fips}${CENSUS_KEY ? `&key=${CENSUS_KEY}` : ''}`
        res = await fetch(url)
        if (res.ok) break
        console.warn(`  Attempt ${attempt} failed: ${res.status} — retrying...`)
        await sleep(attempt * 2000)
      } catch {
        console.warn(`  Attempt ${attempt} fetch error — retrying...`)
        await sleep(attempt * 2000)
      }
    }

    if (!res || !res.ok) {
      console.error(`  Skipping ${state} after 3 failed attempts`)
      await sleep(1000)
      continue
    }

    const raw: string[][] = await res.json()
    const headers = raw[0]

    // Build name → data lookup
    const placeMap = new Map<string, Record<string, string>>()
    for (const row of raw.slice(1)) {
      const data: Record<string, string> = {}
      headers.forEach((h, i) => { data[h] = row[i] })
      // Census NAME: "Austin city, Texas" — extract first part lowercased
      const namePart = (data['NAME'] ?? '').split(',')[0]
        .replace(/\s+(city|town|village|municipality|borough|cdp|unified government|metro government|metropolitan government|consolidated government)$/i, '')
        .trim()
        .toLowerCase()
      placeMap.set(namePart, data)
    }

    for (const cityEntry of stateCities) {
      const cityKey = cityEntry.city.toLowerCase()
      const data = placeMap.get(cityKey) || placeMap.get(cityKey.replace(/\bst\.\s/i, 'saint '))

      if (!data) {
        console.log(`  Not found: ${cityEntry.city}, ${state}`)
        totalSkipped++
        continue
      }

      const total     = parseInt(data['B01003_001E']) || 0
      const hispanic  = parseInt(data['B03003_003E']) || 0
      const white     = parseInt(data['B03002_003E']) || 0
      const black     = parseInt(data['B03002_004E']) || 0
      const asian     = parseInt(data['B03002_006E']) || 0

      if (total <= 0) {
        console.log(`  Skipping ${cityEntry.city} — no population data`)
        totalSkipped++
        continue
      }

      const hispanic_pct = parseFloat(((hispanic / total) * 100).toFixed(2))
      const white_pct    = parseFloat(((white    / total) * 100).toFixed(2))
      const black_pct    = parseFloat(((black    / total) * 100).toFixed(2))
      const asian_pct    = parseFloat(((asian    / total) * 100).toFixed(2))

      const { error: upsertErr } = await supabase
        .from('cities')
        .update({ hispanic_pct, white_pct, black_pct, asian_pct })
        .eq('city', cityEntry.city)
        .eq('state', cityEntry.state)

      if (upsertErr) {
        console.error(`  Error updating ${cityEntry.city}: ${upsertErr.message}`)
        totalSkipped++
      } else {
        console.log(`  Updated ${cityEntry.city} — Hispanic: ${hispanic_pct}%, White: ${white_pct}%, Black: ${black_pct}%, Asian: ${asian_pct}%`)
        totalUpdated++
      }
    }

    await sleep(300)
  }

  console.log(`\nDone. Updated: ${totalUpdated} | Skipped: ${totalSkipped}`)
}

main().catch(console.error)
