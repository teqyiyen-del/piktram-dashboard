'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarkaBilgilerimIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/marka-bilgilerim/abonelik-yonetimi')
  }, [router])

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-gray-500">
      Yönlendiriliyorsunuz...
    </div>
  )
}
