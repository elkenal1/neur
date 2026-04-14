import { NextRequest, NextResponse } from 'next/server'

// Google Places API (Nearby Search)
// Proxied server-side to control usage and cache results in future
//
// NAICS-to-Places type mapping:
// We map broad industry categories to Google Places types so users
// can see relevant competitor businesses on the map.

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
const KEY = process.env.GOOGLE_MAPS_SERVER_KEY

// Maps Neur industry names → Google Places types
const INDUSTRY_TO_PLACE_TYPES: Record<string, string[]> = {
  'Food & Beverage':       ['restaurant', 'bar', 'cafe', 'bakery', 'meal_takeaway'],
  'Retail':                ['clothing_store', 'shoe_store', 'department_store', 'store'],
  'Health & Wellness':     ['pharmacy', 'doctor', 'hospital', 'health'],
  'Fitness':               ['gym', 'health'],
  'Beauty & Personal Care':['beauty_salon', 'hair_care', 'spa'],
  'Education & Tutoring':  ['school', 'university', 'library'],
  'Childcare':             ['school', 'library'],
  'Technology':            ['electronics_store'],
  'Automotive':            ['car_repair', 'car_dealer', 'car_wash', 'gas_station'],
  'Real Estate':           ['real_estate_agency'],
  'Finance':               ['bank', 'finance', 'insurance_agency', 'accounting'],
  'Professional Services': ['lawyer', 'accounting', 'insurance_agency'],
  'Home Services':         ['home_goods_store', 'hardware_store', 'locksmith', 'plumber'],
  'Construction':          ['hardware_store'],
  'Hospitality':           ['lodging', 'hotel'],
  'Entertainment':         ['movie_theater', 'bowling_alley', 'amusement_park', 'night_club'],
  'Transportation':        ['taxi_stand', 'moving_company', 'storage'],
  'Agriculture':           ['florist', 'grocery_or_supermarket'],
  'Manufacturing':         ['storage'],
  'E-commerce':            ['store'],
}

const DEFAULT_TYPES = ['store', 'establishment']

// Industry keywords broaden the search beyond a single place type,
// catching businesses Google doesn't neatly categorize under one type.
const INDUSTRY_KEYWORDS: Record<string, string> = {
  'Food & Beverage':        'restaurant cafe bar',
  'Retail':                 'retail store shop',
  'Health & Wellness':      'health wellness clinic',
  'Fitness':                'gym fitness studio',
  'Beauty & Personal Care': 'salon spa beauty',
  'Education & Tutoring':   'school tutoring education',
  'Childcare':              'daycare childcare preschool',
  'Technology':             'tech software IT',
  'Automotive':             'auto car automotive dealer repair',
  'Real Estate':            'real estate realty',
  'Finance':                'finance bank insurance',
  'Professional Services':  'consulting law accounting',
  'Home Services':          'plumber electrician handyman',
  'Construction':           'construction contractor builder',
  'Hospitality':            'hotel motel lodging',
  'Entertainment':          'entertainment venue theater',
  'Transportation':         'moving taxi logistics',
  'Agriculture':            'farm nursery garden',
  'Manufacturing':          'manufacturing fabrication',
  'E-commerce':             'ecommerce fulfillment warehouse',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '5000' // meters
  const industry = searchParams.get('industry') || ''

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const types = INDUSTRY_TO_PLACE_TYPES[industry] ?? DEFAULT_TYPES
  const type = types[0]
  const keyword = INDUSTRY_KEYWORDS[industry] ?? industry

  const url = new URL(PLACES_BASE)
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', radius)
  url.searchParams.set('type', type)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('key', KEY!)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }) // cache 1hr
    if (!res.ok) throw new Error(`Places API error: ${res.status}`)

    const json = await res.json()

    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      throw new Error(`Places returned: ${json.status}`)
    }

    const places = (json.results || []).slice(0, 20).map((p: {
      place_id: string
      name: string
      vicinity: string
      geometry: { location: { lat: number; lng: number } }
      rating?: number
      user_ratings_total?: number
      business_status?: string
      types?: string[]
    }) => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      rating: p.rating ?? null,
      totalRatings: p.user_ratings_total ?? 0,
      status: p.business_status ?? 'OPERATIONAL',
      types: p.types ?? [],
    }))

    return NextResponse.json({
      industry,
      type,
      count: places.length,
      places,
    })
  } catch (err) {
    console.error('Places API error:', err)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}
