'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('demo@piktram.com')
  const [password, setPassword] = useState('piktram123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.replace('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@piktram.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="password">
          Parola
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-semibold text-accent">
          Hemen kayıt olun
        </Link>
      </p>
    </form>
  )
}
