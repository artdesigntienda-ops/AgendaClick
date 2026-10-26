'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TrackerInner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams?.get('ref')
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase()
      try {
        localStorage.setItem('agendaclick_ref_code', cleanRef)
        // Cookie válida por 30 días
        document.cookie = `agendaclick_ref_code=${cleanRef}; path=/; max-age=2592000; SameSite=Lax`
      } catch (e) {
        console.error('Error guardando código de referido:', e)
      }
    }
  }, [searchParams])

  return null
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  )
}
