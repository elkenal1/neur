'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { recalculateScore } from '@/lib/actions'
import { RefreshCw } from 'lucide-react'

export default function RecalculateButton({ analysisId }: { analysisId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      await recalculateScore(analysisId)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs text-[var(--color-slate)] hover:text-[var(--color-navy)] transition-colors disabled:opacity-50"
    >
      <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Recalculating...' : 'Recalculate Score'}
    </button>
  )
}
