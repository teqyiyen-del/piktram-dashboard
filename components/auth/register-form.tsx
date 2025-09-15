'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('Demo Kullanıcı')
  const [email, setEmail] = useState('demo@piktram.com')
  const [password, setPassword] = useState('piktram123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email
      })
    }

    setLoading(false)
    router.replace('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          Adınız Soyadınız
        </label>
        <input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Örn. Ayşe Yılmaz"
          required
        />
      </div>
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
        {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Hesabınız var mı?{' '}
        <Link href="/auth/login" className="font-semibold text-accent">
          Giriş yapın
        </Link>
      </p>
    </form>
  )
}
