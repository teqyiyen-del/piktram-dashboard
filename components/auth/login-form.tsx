'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('E-posta veya parola hatalı. Lütfen tekrar deneyin.')
      return
    }

    router.replace('/anasayfa')
  }

  const handleOAuth = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) setError('Google ile giriş başarısız oldu.')
  }

  return (
    <div className="space-y-6 text-center">
      {/* Başlık */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tekrar Hoş Geldiniz!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Görevlerinizi ve projelerinizi yönetmek için giriş yapın.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            E-posta Adresi
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@piktram.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm shadow-sm focus:border-[#FF5E4A] focus:ring-2 focus:ring-[#FF5E4A]/20 transition"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Parola
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm shadow-sm focus:border-[#FF5E4A] focus:ring-2 focus:ring-[#FF5E4A]/20 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5E4A] transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full rounded-xl bg-[#FF5E4A] hover:bg-[#fa6a56] text-white font-medium shadow-md transition"
          disabled={loading}
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-gray-200"></span>
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:bg-surface-dark">
          veya
        </span>
      </div>

      {/* Google Login */}
      <Button
        variant="outline"
        className="w-full rounded-xl border-gray-300 hover:bg-gray-50 transition"
        type="button"
        onClick={handleOAuth}
      >
        <Chrome className="h-4 w-4 text-[#FF5E4A]" /> 
        <span className="ml-2 font-medium text-gray-700">Google ile devam et</span>
      </Button>

      <p className="text-sm text-gray-500">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-semibold text-[#FF5E4A] hover:underline">
          Hemen kayıt olun
        </Link>
      </p>
    </div>
  )
}
