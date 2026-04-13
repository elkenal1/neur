// ─── Feasibility Scoring Engine ───────────────────────────────────────────────
// Calculates a 0-100 feasibility score across 5 weighted pillars.
// All inputs come from existing Neur APIs + the analyses table.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisInput {
  id: string
  industry_preference?: string | null
  industry_open_to_suggestions?: boolean
  preferred_state?: string | null
  preferred_city?: string | null
  operation_type?: string | null
  budget_range?: string | null
  launch_timeline?: string | null
  entrepreneur_type?: string | null
  has_industry_experience?: boolean | null
  current_industry?: string | null
  commitment_level?: string | null
  has_business_partners?: boolean | null
  prior_business_ownership?: string | null
  primary_goal?: string | null
}

export interface BLSInput {
  employmentTrend?: string | null
  nationalUnemploymentRate?: string | null
  latestEmployment?: string | null
  sectorLabel?: string | null
}

export interface CensusInput {
  areaName?: string
  population?: string
  medianHouseholdIncome?: string
  medianAge?: string
  unemploymentRate?: string
  medianRent?: string
  bachelorsDegreeCount?: string
}

export interface PlaceInput {
  id: string
  name: string
  rating: number | null
  totalRatings: number
  types: string[]
}

export interface FeasibilityInput {
  analysis: AnalysisInput
  blsData: BLSInput | null
  censusData: CensusInput | null
  competitorPlaces: PlaceInput[]
  radiusMiles?: number
}

export interface PillarResult {
  score: number
  weighted_score: number
  highlights: string[]
  insight: string
}

export interface FeasibilityScore {
  overall_score: number
  label: string
  summary: string
  pillars: {
    market: PillarResult
    competition: PillarResult
    location: PillarResult
    financial: PillarResult
    personal: PillarResult
  }
  whats_working: string[]
  needs_attention: string[]
  next_steps: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NATIONAL_MEDIAN_INCOME = 74580
const NATIONAL_UNEMPLOYMENT = 3.7
const NATIONAL_MEDIAN_RENT = 1300

const INDUSTRY_WEIGHTS: Record<string, { market: number; competition: number; location: number; financial: number; personal: number }> = {
  'Food & Beverage':        { market: 20, competition: 20, location: 25, financial: 20, personal: 15 },
  'Retail':                 { market: 20, competition: 20, location: 25, financial: 20, personal: 15 },
  'E-commerce':             { market: 25, competition: 20, location: 5,  financial: 25, personal: 25 },
  'Technology':             { market: 30, competition: 15, location: 5,  financial: 20, personal: 30 },
  'Professional Services':  { market: 20, competition: 15, location: 5,  financial: 20, personal: 40 },
  'Fitness':                { market: 20, competition: 20, location: 20, financial: 20, personal: 20 },
  'Health & Wellness':      { market: 20, competition: 20, location: 20, financial: 20, personal: 20 },
  'Childcare':              { market: 25, competition: 15, location: 20, financial: 20, personal: 20 },
  'Construction':           { market: 25, competition: 20, location: 10, financial: 25, personal: 20 },
  'Home Services':          { market: 25, competition: 20, location: 15, financial: 20, personal: 20 },
  'Beauty & Personal Care': { market: 20, competition: 20, location: 25, financial: 20, personal: 15 },
  'Education & Tutoring':   { market: 25, competition: 15, location: 15, financial: 20, personal: 25 },
  'Real Estate':            { market: 25, competition: 15, location: 20, financial: 20, personal: 20 },
  'Hospitality':            { market: 20, competition: 20, location: 25, financial: 20, personal: 15 },
  'Entertainment':          { market: 20, competition: 20, location: 25, financial: 20, personal: 15 },
  'Automotive':             { market: 25, competition: 20, location: 20, financial: 25, personal: 10 },
  'Finance':                { market: 20, competition: 15, location: 10, financial: 20, personal: 35 },
  'Transportation':         { market: 25, competition: 20, location: 15, financial: 25, personal: 15 },
  'Agriculture':            { market: 25, competition: 15, location: 20, financial: 25, personal: 15 },
  'Manufacturing':          { market: 25, competition: 15, location: 15, financial: 25, personal: 20 },
}

const DEFAULT_WEIGHTS = { market: 20, competition: 20, location: 20, financial: 20, personal: 20 }

const STARTUP_COSTS: Record<string, { min: number; max: number }> = {
  'Food & Beverage':        { min: 75000,  max: 150000 },
  'Retail':                 { min: 50000,  max: 100000 },
  'E-commerce':             { min: 5000,   max: 20000  },
  'Technology':             { min: 10000,  max: 50000  },
  'Professional Services':  { min: 5000,   max: 25000  },
  'Fitness':                { min: 50000,  max: 150000 },
  'Health & Wellness':      { min: 40000,  max: 100000 },
  'Childcare':              { min: 50000,  max: 100000 },
  'Construction':           { min: 50000,  max: 150000 },
  'Home Services':          { min: 10000,  max: 50000  },
  'Beauty & Personal Care': { min: 40000,  max: 100000 },
  'Education & Tutoring':   { min: 5000,   max: 30000  },
  'Real Estate':            { min: 10000,  max: 50000  },
  'Hospitality':            { min: 100000, max: 500000 },
  'Entertainment':          { min: 50000,  max: 200000 },
  'Automotive':             { min: 75000,  max: 200000 },
  'Finance':                { min: 10000,  max: 50000  },
  'Transportation':         { min: 25000,  max: 100000 },
  'Agriculture':            { min: 50000,  max: 200000 },
  'Manufacturing':          { min: 100000, max: 500000 },
}

const BUDGET_VALUES: Record<string, number> = {
  'under_10k':   10000,
  '10k_50k':     50000,
  '50k_100k':    100000,
  '100k_500k':   500000,
  '500k_plus':   750000,
}

const COMPLEMENTARY_TYPES: Record<string, string[]> = {
  'Food & Beverage':        ['shopping_mall', 'park', 'gym'],
  'Fitness':                ['health', 'pharmacy', 'grocery_or_supermarket'],
  'Retail':                 ['shopping_mall', 'parking', 'transit_station'],
  'Beauty & Personal Care': ['gym', 'shopping_mall', 'spa'],
}
const DEFAULT_COMPLEMENTARY = ['bank', 'pharmacy', 'grocery_or_supermarket']

// ─── Parse Helpers ────────────────────────────────────────────────────────────

function parseCurrency(s: string | null | undefined): number {
  if (!s) return 0
  return parseFloat(s.replace(/[$,]/g, '')) || 0
}

function parsePercent(s: string | null | undefined): number {
  if (!s) return 0
  return parseFloat(s.replace(/[%+]/g, '')) || 0
}

function parseFormattedNumber(s: string | null | undefined): number {
  if (!s) return 0
  return parseFloat(s.replace(/,/g, '')) || 0
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${Math.round(n / 1000)}k`
  return `$${n}`
}

// ─── Pillar 1: Market Opportunity (0–20) ─────────────────────────────────────

function scoreMarket(
  blsData: BLSInput | null,
  censusData: CensusInput | null,
  industry: string,
  locationName: string
): Omit<PillarResult, 'weighted_score'> {
  let score = 0
  const highlights: string[] = []

  // 1. Employment growth (0–6)
  const trend = parsePercent(blsData?.employmentTrend)
  if (trend > 5) score += 6
  else if (trend >= 2) score += 4
  else if (trend >= 0) score += 2
  const trendDir = trend >= 0 ? 'above' : 'below'
  highlights.push(
    `${industry} employment ${trend >= 0 ? 'grew' : 'declined'} ${Math.abs(trend).toFixed(1)}% over the last 12 months, ${trendDir} the national average`
  )

  // 2. Median household income (0–5)
  const income = parseCurrency(censusData?.medianHouseholdIncome)
  if (income > NATIONAL_MEDIAN_INCOME * 1.2) score += 5
  else if (income >= NATIONAL_MEDIAN_INCOME) score += 3
  else if (income > 0) score += 1
  const incomeDir = income >= NATIONAL_MEDIAN_INCOME ? 'above' : 'below'
  if (income > 0) {
    highlights.push(
      `Median household income in ${censusData?.areaName ?? locationName} is $${income.toLocaleString()}, ${incomeDir} the national median of $74,580`
    )
  }

  // 3. Population (0–5)
  const population = parseFormattedNumber(censusData?.population)
  if (population > 500000) score += 5
  else if (population >= 100000) score += 3
  else if (population > 0) score += 1

  // 4. Unemployment rate (0–4)
  const unemployment = parsePercent(censusData?.unemploymentRate)
  if (unemployment > 0 && unemployment < NATIONAL_UNEMPLOYMENT) score += 4
  else if (unemployment <= NATIONAL_UNEMPLOYMENT + 1) score += 2
  if (unemployment > 0) {
    highlights.push(
      `The unemployment rate in ${censusData?.areaName ?? locationName} is ${unemployment}% compared to the national average of 3.7%`
    )
  }

  const insight = trend >= 2
    ? `${industry} is showing positive employment growth, indicating a healthy and expanding market.`
    : `${industry} employment growth is slow — validate local demand carefully before committing capital.`

  return { score, highlights, insight }
}

// ─── Pillar 2: Competition Landscape (0–20) ───────────────────────────────────

function scoreCompetition(
  places: PlaceInput[],
  radiusMiles: number
): Omit<PillarResult, 'weighted_score'> {
  let score = 0
  const highlights: string[] = []
  const count = places.length

  // 1. Competitor count (0–8)
  if (count <= 3) score += 8
  else if (count <= 6) score += 6
  else if (count <= 10) score += 4
  else if (count <= 15) score += 2
  highlights.push(`There are ${count} direct competitors within your ${radiusMiles}-mile radius`)

  // 2. Average competitor rating (0–6)
  const rated = places.filter(p => p.rating !== null && p.rating > 0)
  const avgRating = rated.length > 0
    ? rated.reduce((sum, p) => sum + (p.rating ?? 0), 0) / rated.length
    : 0

  if (rated.length === 0) score += 3
  else if (avgRating < 3.5) score += 6
  else if (avgRating <= 4.0) score += 4
  else if (avgRating <= 4.5) score += 2

  const top5 = [...places]
    .filter(p => p.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)
  if (top5.length > 0) {
    highlights.push(
      `Top rated competitors: ${top5.map(p => `${p.name} (${p.rating}★)`).join(', ')}`
    )
  }

  // 3. Unrated businesses (0–6)
  const unrated = places.filter(p => !p.rating || p.totalRatings === 0)
  const unratedPct = places.length > 0 ? (unrated.length / places.length) * 100 : 0
  if (unratedPct >= 30) score += 6
  else if (unratedPct >= 10) score += 3
  if (unrated.length > 2) {
    highlights.push(
      `${unrated.length} of the nearby competitors have no ratings, suggesting an underdeveloped market`
    )
  }

  const insight = count <= 6
    ? `Low competition density suggests a potential market gap you can capitalize on.`
    : `High competition in your area — a clear differentiation strategy will be critical to stand out.`

  return { score, highlights, insight }
}

// ─── Pillar 3: Location Viability (0–20) ──────────────────────────────────────

function scoreLocation(
  censusData: CensusInput | null,
  operation_type: string | null | undefined,
  places: PlaceInput[],
  industry: string
): Omit<PillarResult, 'weighted_score'> {
  const highlights: string[] = []

  if (operation_type === 'online') {
    return {
      score: 14,
      highlights: ['As an online business, your location viability score reflects market access rather than physical factors'],
      insight: 'Your online model gives you geographic flexibility — focus on digital market reach and online customer acquisition.',
    }
  }

  let score = 0

  // 1. Median rent vs national (0–6)
  const rent = parseCurrency(censusData?.medianRent)
  if (rent > 0 && rent < NATIONAL_MEDIAN_RENT) score += 6
  else if (rent > 0 && rent <= NATIONAL_MEDIAN_RENT * 1.2) score += 4
  else if (rent > 0) score += 2
  const rentDir = rent > 0 && rent < NATIONAL_MEDIAN_RENT ? 'below' : 'above'
  const rentDisplay = rent > 0 ? `$${rent.toLocaleString()}` : 'N/A'
  highlights.push(
    `Median rent in ${censusData?.areaName ?? 'your area'} is ${rentDisplay}/month, ${rentDir} the national median of $1,300`
  )

  // 2. Complementary businesses nearby (0–8)
  const compTypes = COMPLEMENTARY_TYPES[industry] ?? DEFAULT_COMPLEMENTARY
  const compCount = places.filter(p => p.types.some(t => compTypes.includes(t))).length
  if (compCount >= 3) score += 8
  else if (compCount >= 1) score += 4
  highlights.push(
    `${compCount} complementary businesses found nearby that could drive foot traffic to your location`
  )

  // 3. Median household income — location context (0–6)
  const income = parseCurrency(censusData?.medianHouseholdIncome)
  if (income > NATIONAL_MEDIAN_INCOME) score += 6
  else if (income >= NATIONAL_MEDIAN_INCOME * 0.9) score += 3
  else if (income > 0) score += 1

  const insight = score >= 14
    ? `Strong location indicators — cost, foot traffic potential, and purchasing power align well for this business type.`
    : `Location economics present some challenges — scout multiple neighborhoods before committing to a lease.`

  return { score, highlights, insight }
}

// ─── Pillar 4: Financial Readiness (0–20) ─────────────────────────────────────

function scoreFinancial(
  budget_range: string | null | undefined,
  launch_timeline: string | null | undefined,
  prior_business_ownership: string | null | undefined,
  industry: string
): Omit<PillarResult, 'weighted_score'> {
  let score = 0
  const highlights: string[] = []

  const costs = STARTUP_COSTS[industry] ?? { min: 25000, max: 100000 }
  const budget = BUDGET_VALUES[budget_range ?? ''] ?? 0
  const budgetMeetsMin = budget >= costs.min

  // 1. Budget vs startup minimum (0–10)
  if (budgetMeetsMin) score += 10
  else if (budget >= costs.min * 0.75) score += 6
  else if (budget >= costs.min * 0.5) score += 3

  highlights.push(
    `The estimated startup cost for ${industry} is ${formatMoney(costs.min)}–${formatMoney(costs.max)}. Your stated budget ${budgetMeetsMin ? 'meets' : 'falls short of'} this range`
  )
  if (budget < costs.min * 0.5) {
    highlights.push(`Consider SBA loan options to bridge the gap between your budget and typical startup costs for this industry`)
  }

  // 2. Launch timeline (0–4)
  if (launch_timeline === 'asap') {
    score += budgetMeetsMin ? 4 : 1
    if (!budgetMeetsMin) {
      highlights.push(`Launching immediately with a budget below the industry minimum carries significant financial risk`)
    }
  } else if (launch_timeline === '3_6_months' || launch_timeline === '6_12_months') {
    score += 4
  } else if (launch_timeline === '1_plus_years') {
    score += 3
  }

  const timelineLabels: Record<string, string> = {
    'asap': 'immediately',
    '3_6_months': 'in 3–6 months',
    '6_12_months': 'in 6–12 months',
    '1_plus_years': 'in 1+ years',
  }
  const timelineText = timelineLabels[launch_timeline ?? ''] ?? 'soon'
  const timelineOk = !(launch_timeline === 'asap' && !budgetMeetsMin)
  highlights.push(
    `Your launch timeline of ${timelineText} ${timelineOk ? 'is achievable' : 'is not realistic'} given your budget and industry startup requirements`
  )

  // 3. Prior business ownership (0–6)
  if (prior_business_ownership === 'currently_own' || prior_business_ownership === 'previously_owned') {
    score += 6
  } else {
    score += 2
  }

  const insight = score >= 14
    ? `Your financial position is solid relative to typical startup costs for this industry.`
    : `Financial preparation is a key risk area — securing additional capital before launch is strongly recommended.`

  return { score, highlights, insight }
}

// ─── Pillar 5: Personal Readiness (0–20) ──────────────────────────────────────

function scorePersonal(
  has_industry_experience: boolean | null | undefined,
  current_industry: string | null | undefined,
  commitment_level: string | null | undefined,
  has_business_partners: boolean | null | undefined,
  prior_business_ownership: string | null | undefined,
): Omit<PillarResult, 'weighted_score'> {
  let score = 0
  const highlights: string[] = []

  // 1. Industry experience (0–6)
  if (has_industry_experience) {
    score += 6
    highlights.push(
      `You have direct experience in ${current_industry ?? 'this industry'} — one of the strongest predictors of business success`
    )
  }

  // 2. Commitment level (0–6)
  if (commitment_level === 'full_time') {
    score += 6
    highlights.push(`You are pursuing this full-time — businesses started full-time have a significantly higher 3-year survival rate`)
  } else {
    score += 2
  }

  // 3. Prior business ownership (0–4)
  if (prior_business_ownership === 'currently_own') {
    score += 4
    highlights.push(`You currently own a business — your operational experience significantly reduces early-stage risk`)
  } else if (prior_business_ownership === 'previously_owned') {
    score += 3
    highlights.push(`You have previously owned a business — your operational experience reduces early-stage risk`)
  }

  // 4. Has partners (0–4)
  if (has_business_partners) {
    score += 4
    highlights.push(`You have a business partner — shared responsibility reduces early burnout and increases accountability`)
  } else {
    score += 2
  }

  // Warning flag
  if (!has_industry_experience && commitment_level === 'part_time') {
    highlights.push(`Consider gaining industry experience before launching, or committing full-time to accelerate your learning curve`)
  }

  const insight = score >= 14
    ? `Your background and commitment level position you well for entrepreneurial success.`
    : `Building more industry knowledge or committing more time before launch will significantly improve your odds.`

  return { score, highlights, insight }
}

// ─── Next Steps Generator ────────────────────────────────────────────────────

function generateNextSteps(
  analysis: AnalysisInput,
  sortedPillars: Array<{ name: string; pillar: PillarResult }>
): string[] {
  const steps: string[] = []
  const weakest = sortedPillars.slice(-2).map(e => e.name)
  const industry = analysis.industry_preference ?? 'your industry'
  const costs = STARTUP_COSTS[industry] ?? { min: 25000, max: 100000 }
  const budget = BUDGET_VALUES[analysis.budget_range ?? ''] ?? 0

  if (weakest.includes('financial')) {
    if (budget < costs.min) {
      steps.push(`Research SBA 7(a) loans or microloans to bridge your funding gap — visit sba.gov to check eligibility and apply`)
    } else {
      steps.push(`Build a detailed 12-month cash flow projection before committing capital to validate your financial runway`)
    }
  }

  if (weakest.includes('competition')) {
    steps.push(`Visit your top 5 local competitors in person, document their pricing, service gaps, and reviews to identify your differentiation angle`)
  }

  if (weakest.includes('personal')) {
    if (!analysis.has_industry_experience) {
      steps.push(`Work in the industry for 3–6 months before launching — firsthand operational knowledge significantly improves survival odds`)
    } else if (analysis.commitment_level === 'part_time') {
      steps.push(`Create a transition plan to move to full-time commitment — set a specific revenue milestone that triggers your shift`)
    }
  }

  if (weakest.includes('market')) {
    steps.push(`Survey 20 potential customers in your target area about willingness to pay and current alternatives before investing`)
  }

  if (weakest.includes('location')) {
    steps.push(`Scout 3 commercial locations in your target area and compare rent, foot traffic counts, and proximity to your target customer`)
  }

  const fallbacks = [
    `Register your business as an LLC with your state — protects personal assets and establishes business credibility`,
    `Apply for an EIN at irs.gov — free, instant, and required for banking, hiring, and tax filing`,
    `Open a dedicated business bank account to separate personal and business finances from day one`,
  ]
  let i = 0
  while (steps.length < 3 && i < fallbacks.length) {
    steps.push(fallbacks[i++])
  }

  return steps.slice(0, 3)
}

// ─── Summary Builder ─────────────────────────────────────────────────────────

function buildSummary(
  locationName: string,
  industry: string,
  topPillar: string,
  bottomPillar: string,
  overall: number
): string {
  const positives: Record<string, string> = {
    market: `strong market demand for ${industry}`,
    competition: `manageable competition in the local market`,
    location: `favorable location economics`,
    financial: `solid financial preparation`,
    personal: `strong personal qualifications and commitment`,
  }
  const concerns: Record<string, string> = {
    market: `market conditions warrant careful validation`,
    competition: `high competition will require a clear differentiation strategy`,
    location: `location costs and foot traffic present challenges`,
    financial: `the gap between your budget and startup costs needs addressing before launch`,
    personal: `additional experience or commitment time would improve your odds significantly`,
  }

  const pos = positives[topPillar] ?? 'strong indicators'
  const con = concerns[bottomPillar] ?? 'some areas need attention'

  if (overall >= 75) {
    return `${locationName} shows ${pos}, and overall conditions are well-aligned for a successful launch.`
  }
  return `${locationName} shows ${pos}, but ${con}.`
}

// ─── Main Function ────────────────────────────────────────────────────────────

export function calculateFeasibilityScore(input: FeasibilityInput): FeasibilityScore {
  const { analysis, blsData, censusData, competitorPlaces, radiusMiles = 5 } = input

  const industry = analysis.industry_preference ?? 'General Business'
  const locationName = [analysis.preferred_city, analysis.preferred_state]
    .filter(Boolean).join(', ') || 'Your area'

  const weights = INDUSTRY_WEIGHTS[industry] ?? DEFAULT_WEIGHTS

  // Score each pillar
  const marketRaw   = scoreMarket(blsData, censusData, industry, locationName)
  const compRaw     = scoreCompetition(competitorPlaces, radiusMiles)
  const locRaw      = scoreLocation(censusData, analysis.operation_type, competitorPlaces, industry)
  const finRaw      = scoreFinancial(analysis.budget_range, analysis.launch_timeline, analysis.prior_business_ownership, industry)
  const perRaw      = scorePersonal(
    analysis.has_industry_experience,
    analysis.current_industry,
    analysis.commitment_level,
    analysis.has_business_partners,
    analysis.prior_business_ownership,
  )

  // Apply weights: weighted_score = (raw / 20) * weight
  const applyWeight = (raw: number, w: number) => Math.round((raw / 20) * w * 10) / 10

  const market:     PillarResult = { ...marketRaw, weighted_score: applyWeight(marketRaw.score, weights.market) }
  const competition:PillarResult = { ...compRaw,   weighted_score: applyWeight(compRaw.score,   weights.competition) }
  const location:   PillarResult = { ...locRaw,    weighted_score: applyWeight(locRaw.score,    weights.location) }
  const financial:  PillarResult = { ...finRaw,    weighted_score: applyWeight(finRaw.score,    weights.financial) }
  const personal:   PillarResult = { ...perRaw,    weighted_score: applyWeight(perRaw.score,    weights.personal) }

  const overall_score = Math.round(
    market.weighted_score + competition.weighted_score + location.weighted_score +
    financial.weighted_score + personal.weighted_score
  )

  const label =
    overall_score >= 80 ? 'Strong Opportunity' :
    overall_score >= 60 ? 'Promising' :
    overall_score >= 40 ? 'Proceed with Caution' :
    overall_score >= 20 ? 'High Risk' :
    'Not Recommended Now'

  // Sort pillars for what's working / needs attention
  const pillarEntries = [
    { name: 'market',      pillar: market },
    { name: 'competition', pillar: competition },
    { name: 'location',    pillar: location },
    { name: 'financial',   pillar: financial },
    { name: 'personal',    pillar: personal },
  ].sort((a, b) => b.pillar.weighted_score - a.pillar.weighted_score)

  const whats_working = pillarEntries
    .slice(0, 3)
    .map(e => e.pillar.highlights[0])
    .filter(Boolean)

  const needs_attention = pillarEntries
    .slice(-2)
    .map(e => e.pillar.insight)
    .filter(Boolean)

  const next_steps = generateNextSteps(analysis, pillarEntries)

  const summary = buildSummary(
    locationName,
    industry,
    pillarEntries[0].name,
    pillarEntries[pillarEntries.length - 1].name,
    overall_score
  )

  return {
    overall_score,
    label,
    summary,
    pillars: { market, competition, location, financial, personal },
    whats_working,
    needs_attention,
    next_steps,
  }
}
