import { NextRequest, NextResponse } from 'next/server'

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    const json = await res.json()

    if (json.status !== 'OK' || !json.results[0]) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { lat, lng } = json.results[0].geometry.location
    return NextResponse.json({ lat, lng, formatted: json.results[0].formatted_address })
  } catch (err) {
    console.error('Geocode error:', err)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
