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

// Maps industry preference to the most granular available BLS series
// Using NAICS-based CES detailed industry codes where possible
const INDUSTRY_SERIES: Record<string, { seriesId: string; label: string; wagesSeries?: string }> = {
  // Leisure & Hospitality — granular subsectors
  'Food & Beverage':          { seriesId: 'CES7072000001', label: 'Food Services & Drinking Places',   wagesSeries: 'CES7072000008' },
  'Hospitality':              { seriesId: 'CES7071000001', label: 'Accommodation',                     wagesSeries: 'CES7071000008' },
  'Entertainment':            { seriesId: 'CES7071100001', label: 'Arts, Entertainment & Recreation',  wagesSeries: 'CES7000000008' },

  // Retail & Trade
  'Retail':                   { seriesId: 'CES4200000001', label: 'Retail Trade',                      wagesSeries: 'CES4200000008' },
  'E-commerce':               { seriesId: 'CES4200000001', label: 'Retail Trade',                      wagesSeries: 'CES4200000008' },
  'Transportation':           { seriesId: 'CES4300000001', label: 'Transportation & Warehousing',      wagesSeries: 'CES4300000008' },

  // Professional & Business Services
  'Professional Services':    { seriesId: 'CES6000000001', label: 'Professional & Business Services',  wagesSeries: 'CES6000000008' },
  'Real Estate':              { seriesId: 'CES5552200001', label: 'Real Estate',                       wagesSeries: 'CES5500000008' },
  'Finance':                  { seriesId: 'CES5552100001', label: 'Finance & Insurance',               wagesSeries: 'CES5500000008' },

  // Technology & Information
  'Technology':               { seriesId: 'CES5000000001', label: 'Information & Technology',          wagesSeries: 'CES5000000008' },

  // Education & Health
  'Health & Wellness':        { seriesId: 'CES6562000001', label: 'Health Care & Social Assistance',   wagesSeries: 'CES6500000008' },
  'Fitness':                  { seriesId: 'CES6562000001', label: 'Health Care & Social Assistance',   wagesSeries: 'CES6500000008' },
  'Education & Tutoring':     { seriesId: 'CES6561000001', label: 'Educational Services',              wagesSeries: 'CES6500000008' },
  'Childcare':                { seriesId: 'CES6562000001', label: 'Health Care & Social Assistance',   wagesSeries: 'CES6500000008' },

  // Construction & Trades
  'Construction':             { seriesId: 'CES2000000001', label: 'Construction',                      wagesSeries: 'CES2000000008' },
  'Home Services':            { seriesId: 'CES2000000001', label: 'Construction & Home Services',      wagesSeries: 'CES2000000008' },

  // Manufacturing
  'Manufacturing':            { seriesId: 'CES3000000001', label: 'Manufacturing',                     wagesSeries: 'CES3000000008' },

  // Other Services
  'Beauty & Personal Care':   { seriesId: 'CES8000000001', label: 'Other Personal Services',           wagesSeries: 'CES8000000008' },
  'Automotive':               { seriesId: 'CES8000000001', label: 'Other Services (Automotive)',       wagesSeries: 'CES8000000008' },

  // Agriculture / Natural Resources
  'Agriculture':              { seriesId: 'CES1000000001', label: 'Natural Resources & Mining',        wagesSeries: 'CES1000000008' },
}

const DEFAULT_SERIES = { seriesId: 'CES6000000001', label: 'Professional & Business Services', wagesSeries: 'CES6000000008' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry') || ''

  const { seriesId, label, wagesSeries } = INDUSTRY_SERIES[industry] ?? DEFAULT_SERIES
  const wagesSeriesId = wagesSeries ?? 'CEU0000000008'

  // Fetch: industry employment + national unemployment + industry-specific wages + weekly hours
  const weeklyHoursSeries = wagesSeriesId.replace('000008', '000007') // hours series = wages series with 07 suffix
  const seriesIds = [seriesId, 'LNS14000000', wagesSeriesId, weeklyHoursSeries]
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
    const wagesData = results[wagesSeriesId] ?? []
    const hoursData = results[weeklyHoursSeries] ?? []

    // Calculate employment trend (latest vs 12 months ago)
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
        ? `$${parseFloat(wagesData[0].value).toFixed(2)}/hr`
        : 'N/A',
      avgWeeklyHours: hoursData[0]
        ? `${hoursData[0].value} hrs/wk`
        : 'N/A',
      employmentHistory: industryData.slice(0, 12).reverse().map((d) => ({
        period: `${d.year}-${d.period.replace('M', '')}`,
        value: parseFloat(d.value),
      })),
    })
  } catch (err) {
    console.error('BLS API error:', err)
    return NextResponse.json({ error: 'Failed to fetch BLS data' }, { status: 500 })
  }
}
