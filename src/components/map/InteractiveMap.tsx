'use client'

import { useState, useRef, useEffect } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { MapPin, Star, X, Minus, Plus, Crosshair } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  totalRatings: number
  status: string
  types: string[]
}

interface DemographicData {
  areaName: string
  population: string
  medianHouseholdIncome: string
  medianAge: string
  unemploymentRate: string
  medianRent: string
}

interface Props {
  defaultLat?: number
  defaultLng?: number
  defaultCity?: string
  defaultState?: string
  industry?: string
  isPaid?: boolean
}

// ─── Radius Circle ─────────────────────────────────────────────────────────────

function RadiusCircle({ center, radiusMeters }: { center: google.maps.LatLngLiteral; radiusMeters: number }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const circleRef = useRef<google.maps.Circle | null>(null)

  useEffect(() => {
    if (!mapsLib || !map) return

    if (!circleRef.current) {
      circleRef.current = new mapsLib.Circle({
        map,
        center,
        radius: radiusMeters,
        fillColor: '#12126B',
        fillOpacity: 0.08,
        strokeColor: '#12126B',
        strokeOpacity: 0.6,
        strokeWeight: 2,
      })
    } else {
      circleRef.current.setCenter(center)
      circleRef.current.setRadius(radiusMeters)
    }

    return () => {
      circleRef.current?.setMap(null)
      circleRef.current = null
    }
  }, [map, mapsLib, center, radiusMeters])

  return null
}

// ─── Main Map ─────────────────────────────────────────────────────────────────

function MapInner({
  defaultLat, defaultLng, industry, isPaid, defaultState
}: {
  defaultLat: number; defaultLng: number; industry: string;
  isPaid: boolean; defaultState: string;
}) {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: defaultLat, lng: defaultLng })
  const [radiusMiles, setRadiusMiles] = useState(5)
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [demographics, setDemographics] = useState<DemographicData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const radiusMeters = Math.round(radiusMiles * 1609.34)

  async function searchArea() {
    setLoading(true)
    setSelectedPlace(null)

    const [placesRes, censusRes] = await Promise.all([
      fetch(`/api/places?lat=${center.lat}&lng=${center.lng}&radius=${radiusMeters}&industry=${encodeURIComponent(industry)}`),
      fetch(`/api/census?lat=${center.lat}&lng=${center.lng}`),
    ])

    const placesData = await placesRes.json()
    const censusData = await censusRes.json()
    if (!censusData.error) setDemographics(censusData)

    setPlaces(placesData.places || [])
    setSearched(true)
    setLoading(false)
  }

  function handleMapClick(e: { detail: { latLng: google.maps.LatLngLiteral | null } }) {
    if (e.detail.latLng) {
      setCenter(e.detail.latLng)
      setSearched(false)
      setPlaces([])
    }
  }

  const avgRating = places.length > 0
    ? (places.filter(p => p.rating).reduce((a, b) => a + (b.rating ?? 0), 0) / places.filter(p => p.rating).length).toFixed(1)
    : null

  return (
    <div className="flex h-full">

      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-[var(--color-border)] flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-[var(--color-navy)] text-sm mb-1">Market Explorer</h2>
          <p className="text-xs text-[var(--color-slate)]">Click the map to place your radius, then search.</p>
        </div>

        {/* Radius control */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-2">
            Search Radius: <span className="text-[var(--color-navy)]">{radiusMiles} mi</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRadiusMiles(r => Math.max(1, r - 1))}
              className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            >
              <Minus size={12} />
            </button>
            <input
              type="range" min={1} max={25} value={radiusMiles}
              onChange={e => setRadiusMiles(Number(e.target.value))}
              className="flex-1 accent-[var(--color-navy)]"
            />
            <button
              onClick={() => setRadiusMiles(r => Math.min(25, r + 1))}
              className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {[1, 5, 10, 25].map(mi => (
              <button
                key={mi}
                onClick={() => setRadiusMiles(mi)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  radiusMiles === mi
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'bg-[var(--color-muted)] text-[var(--color-slate)] hover:bg-[var(--color-border)]'
                }`}
              >
                {mi}mi
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="text-xs font-semibold text-[var(--color-foreground)] mb-1">Industry Filter</div>
          <div className="bg-[var(--color-muted)] rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-navy)]">
            {industry || 'All Businesses'}
          </div>
        </div>

        {/* Search button */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <button
            onClick={searchArea}
            disabled={loading}
            className="w-full bg-[var(--color-navy)] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[var(--color-navy-light)] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            <Crosshair size={14} />
            {loading ? 'Searching...' : 'Search This Area'}
          </button>
        </div>

        {/* Results summary */}
        {searched && (
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-3">Results</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--color-muted)] rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-[var(--color-navy)]">{places.length}</div>
                <div className="text-[10px] text-[var(--color-slate)]">Competitors</div>
              </div>
              <div className="bg-[var(--color-muted)] rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-amber-500">{avgRating ?? '—'}</div>
                <div className="text-[10px] text-[var(--color-slate)]">Avg Rating</div>
              </div>
            </div>
            {places.length < 5 && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700 font-medium">
                ✅ Low competition — potential market gap
              </div>
            )}
            {places.length >= 10 && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
                ⚠️ High competition — consider a different area
              </div>
            )}
          </div>
        )}

        {/* Demographics */}
        {isPaid && demographics && (
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1">Demographics</div>
            {demographics.areaName && (
              <div className="text-[10px] text-[var(--color-blue)] font-medium mb-2">{demographics.areaName}</div>
            )}
            <div className="space-y-2">
              {[
                ['Population', demographics.population],
                ['Median Income', demographics.medianHouseholdIncome],
                ['Median Age', `${demographics.medianAge} yrs`],
                ['Unemployment', demographics.unemploymentRate],
                ['Median Rent', demographics.medianRent],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center text-xs bg-[var(--color-muted)] px-3 py-2 rounded-lg gap-2">
                  <span className="text-[var(--color-slate)] shrink-0">{label}</span>
                  <span className="font-semibold text-[var(--color-navy)] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Place list */}
        {places.length > 0 && (
          <div className="p-4 flex-1">
            <div className="text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-3">
              Nearby Businesses
            </div>
            <div className="space-y-2">
              {places.map(place => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(p => p?.id === place.id ? null : place)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                    selectedPlace?.id === place.id
                      ? 'border-[var(--color-navy)] bg-[var(--color-navy)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-blue)]'
                  }`}
                >
                  <div className="font-semibold text-[var(--color-navy)] truncate">{place.name}</div>
                  {place.rating && (
                    <div className="flex items-center gap-1 mt-0.5 text-[var(--color-slate)]">
                      <Star size={10} className="text-amber-400" fill="currentColor" />
                      <span>{place.rating} ({place.totalRatings})</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          defaultCenter={{ lat: defaultLat, lng: defaultLng }}
          defaultZoom={11}
          mapId="neur-map"
          onClick={handleMapClick}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          {/* Radius circle */}
          <RadiusCircle center={center} radiusMeters={radiusMeters} />

          {/* Center pin */}
          <AdvancedMarker position={center}>
            <div className="bg-[var(--color-navy)] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
              <Crosshair size={14} />
            </div>
          </AdvancedMarker>

          {/* Competitor pins */}
          {places.map(place => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => setSelectedPlace(p => p?.id === place.id ? null : place)}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: selectedPlace?.id === place.id ? '#F59E0B' : '#2563EB',
                  border: '2px solid white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
            </AdvancedMarker>
          ))}
        </Map>

        {/* Selected place popup */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] p-4 w-72 z-10">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-[var(--color-navy)] text-sm">{selectedPlace.name}</h3>
              <button onClick={() => setSelectedPlace(null)} className="text-[var(--color-slate)] hover:text-[var(--color-navy)]">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-[var(--color-slate)] mb-2">{selectedPlace.address}</p>
            <div className="flex items-center gap-3 text-xs">
              {selectedPlace.rating && (
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400" fill="currentColor" />
                  <span className="font-semibold">{selectedPlace.rating}</span>
                  <span className="text-[var(--color-slate)]">({selectedPlace.totalRatings})</span>
                </div>
              )}
              <span className={`font-semibold ${selectedPlace.status === 'OPERATIONAL' ? 'text-[var(--color-emerald)]' : 'text-red-500'}`}>
                {selectedPlace.status === 'OPERATIONAL' ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        )}

        {/* Click hint */}
        {!searched && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-xl shadow-md border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-navy)] flex items-center gap-2 pointer-events-none">
            <MapPin size={13} /> Click anywhere on the map to set your search center
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function InteractiveMap(props: Props) {
  const {
    defaultLat = 30.2672,
    defaultLng = -97.7431,
    defaultState = '',
    industry = '',
    isPaid = false,
  } = props

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <MapInner
        defaultLat={defaultLat}
        defaultLng={defaultLng}
        defaultState={defaultState}
        industry={industry}
        isPaid={isPaid}
      />
    </APIProvider>
  )
}
