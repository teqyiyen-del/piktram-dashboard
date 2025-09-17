'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Github, Apple, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya parola hatalı. Lütfen bilgilerinizi kontrol edin.',
  'Email not confirmed': 'E-posta adresinizi doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin.',
  default: 'Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.'
}

export function LoginForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('') // istersen 'demo@piktram.com' yapabilirsin
  const [password, setPassword] = useState('') // istersen 'piktram123' yapabilirsin
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translateError = (message: string) => {
    return errorMessages[message] ?? errorMessages.default
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(translateError(error.message))
      return
    }

    router.replace('/anasayfa')
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'apple') => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) {
      setError(translateError(error.message))
    }
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="space-y-2 text-left">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tekrar hoş geldiniz</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Görevlerinizi yönetmek için hesabınıza giriş yapın.
        </p>
      </div>

      {/* OAuth */}
      <div className="grid gap-3">
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('google')}>
          <Chrome className="h-4 w-4" /> Google ile devam et
        </Button>
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('github')}>
          <Github className="h-4 w-4" /> GitHub ile devam et
        </Button>
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('apple')}>
          <Apple className="h-4 w-4" /> Apple ile devam et
        </Button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-gray-200"></span>
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:bg-surface-dark">
          veya e-posta ile
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
            E-posta Adresi
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@piktram.com"
              className="pl-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
            Parola
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-right">
            <a
              href="https://supabase.com/docs/guides/auth/auth-password-reset"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-accent hover:text-accent-dark"
            >
              Şifremi unuttum
            </a>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-semibold text-accent">
          Hemen kayıt olun
        </Link>
      </p>
    </div>
  )
}
