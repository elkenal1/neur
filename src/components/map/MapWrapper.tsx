'use client'

import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(
  () => import('./InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-muted)] text-[var(--color-slate)] text-sm">
        Loading map...
      </div>
    ),
  }
)

interface Props {
  defaultLat: number
  defaultLng: number
  defaultState: string
  industry: string
  isPaid: boolean
}

export default function MapWrapper(props: Props) {
  return <InteractiveMap {...props} />
}
