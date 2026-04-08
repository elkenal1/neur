import { NextRequest, NextResponse } from 'next/server'

// BLS Public Data API v2
// Docs: https://www.bls.gov/developers/api_signature_v2.htm
//
// Series IDs we use:
//   CES0000000001 — Total nonfarm employment (national)
//   LNS14000000   — National unemployment rate
//   CUUR0000SA0   — CPI (inflation)
//   CEU0000000008 — Average hourly earnings (all industries)
//
// Industry-specific series are built from NAICS supersector codes:
//   CES1000000001 — Mining/Logging
//   CES2000000001 — Construction
//   CES3000000001 — Manufacturing
//   CES4000000001 — Trade, Transport, Utilities
//   CES5000000001 — Information
//   CES5500000001 — Financial Activities
//   CES6000000001 — Professional & Business Services
//   CES6500000001 — Education & Health Services
//   CES7000000001 — Leisure & Hospitality
//   CES8000000001 — Other Services
//   CES9000000001 — Government

const BLS_BASE = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
const KEY = process.env.BLS_API_KEY

// Maps industry preference to BLS supersector series
const INDUSTRY_SERIES: Record<string, { seriesId: string; label: string }> = {
  'Food & Beverage':          { seriesId: 'CES7000000001', label: 'Leisure & Hospitality' },
  'Hospitality':              { seriesId: 'CES7000000001', label: 'Leisure & Hospitality' },
  'Entertainment':            { seriesId: 'CES7000000001', label: 'Leisure & Hospitality' },
  'Retail':                   { seriesId: 'CES4000000001', label: 'Trade, Transport & Utilities' },
  'E-commerce':               { seriesId: 'CES4000000001', label: 'Trade, Transport & Utilities' },
  'Transportation':           { seriesId: 'CES4000000001', label: 'Trade, Transport & Utilities' },
  'Technology':               { seriesId: 'CES5000000001', label: 'Information & Technology' },
  'Finance':                  { seriesId: 'CES5500000001', label: 'Financial Activities' },
  'Real Estate':              { seriesId: 'CES5500000001', label: 'Financial Activities' },
  'Professional Services':    { seriesId: 'CES6000000001', label: 'Professional & Business Services' },
  'Health & Wellness':        { seriesId: 'CES6500000001', label: 'Education & Health Services' },
  'Fitness':                  { seriesId: 'CES6500000001', label: 'Education & Health Services' },
  'Education & Tutoring':     { seriesId: 'CES6500000001', label: 'Education & Health Services' },
  'Childcare':                { seriesId: 'CES6500000001', label: 'Education & Health Services' },
  'Construction':             { seriesId: 'CES2000000001', label: 'Construction' },
  'Home Services':            { seriesId: 'CES2000000001', label: 'Construction & Home Services' },
  'Manufacturing':            { seriesId: 'CES3000000001', label: 'Manufacturing' },
  'Agriculture':              { seriesId: 'CES1000000001', label: 'Natural Resources & Mining' },
  'Beauty & Personal Care':   { seriesId: 'CES8000000001', label: 'Other Services' },
  'Automotive':               { seriesId: 'CES8000000001', label: 'Other Services' },
}

const DEFAULT_SERIES = { seriesId: 'CES6000000001', label: 'Professional & Business Services' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry') || ''

  const { seriesId, label } = INDUSTRY_SERIES[industry] ?? DEFAULT_SERIES

  // Fetch: industry employment + national unemployment + avg hourly earnings
  const seriesIds = [seriesId, 'LNS14000000', 'CEU0000000008']
  const currentYear = new Date().getFullYear()

  const body = {
    seriesid: seriesIds,
    startyear: String(currentYear - 4),
    endyear: String(currentYear),
    registrationkey: KEY,
  }

  try {
    const res = await fetch(BLS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 86400 }, // cache 24h
    })

    if (!res.ok) throw new Error(`BLS API error: ${res.status}`)

    const json = await res.json()

    if (json.status !== 'REQUEST_SUCCEEDED') {
      throw new Error(`BLS returned: ${json.status}`)
    }

    // Parse series results
    const results: Record<string, { year: string; period: string; value: string }[]> = {}
    for (const series of json.Results.series) {
      results[series.seriesID] = series.data.slice(0, 12) // last 12 periods
    }

    const industryData = results[seriesId] ?? []
    const unemploymentData = results['LNS14000000'] ?? []
    const wagesData = results['CEU0000000008'] ?? []

    // Calculate employment trend (latest vs 2 years ago)
    let employmentTrend = null
    if (industryData.length >= 2) {
      const latest = parseFloat(industryData[0].value)
      const older = parseFloat(industryData[Math.min(11, industryData.length - 1)].value)
      const pct = (((latest - older) / older) * 100).toFixed(1)
      employmentTrend = `${parseFloat(pct) >= 0 ? '+' : ''}${pct}%`
    }

    return NextResponse.json({
      industry,
      sectorLabel: label,
      latestEmployment: industryData[0]
        ? `${(parseFloat(industryData[0].value) / 1000).toFixed(1)}M`
        : 'N/A',
      employmentTrend,
      nationalUnemploymentRate: unemploymentData[0]
        ? `${unemploymentData[0].value}%`
        : 'N/A',
      avgHourlyEarnings: wagesData[0]
        ? `$${wagesData[0].value}/hr`
        : 'N/A',
      employmentHistory: industryData.slice(0, 8).reverse().map((d) => ({
        period: `${d.year} ${d.period.replace('M', 'M')}`,
        value: parseFloat(d.value),
      })),
    })
  } catch (err) {
    console.error('BLS API error:', err)
    return NextResponse.json({ error: 'Failed to fetch BLS data' }, { status: 500 })
  }
}
