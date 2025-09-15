'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Github, Apple, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

const registerErrors: Record<string, string> = {
  'User already registered': 'Bu e-posta adresi ile daha önce kayıt yapılmış. Lütfen giriş yapın.',
  'Password should be at least 6 characters': 'Parolanız en az 6 karakter olmalıdır.',
  'Database error saving new user': 'Kayıt sırasında beklenmedik bir veri tabanı hatası oluştu. Lütfen kısa süre sonra tekrar deneyin.',
  default: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
}

export function RegisterForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const translateError = (message: string) => registerErrors[message] ?? registerErrors.default

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

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
      setError(translateError(error.message))
      setLoading(false)
      return
    }

    const userId = data.user?.id ?? data.session?.user.id

    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        email,
        role: 'user'
      })
    }

    setLoading(false)

    if (data.session) {
      router.replace('/dashboard')
    } else {
      setSuccess('Kayıt başarılı! Lütfen e-posta kutunuzu kontrol ederek hesabınızı doğrulayın.')
    }
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'apple') => {
    setError(null)
    setSuccess(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) {
      setError(translateError(error.message))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Yeni hesap oluştur</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Piktram ile projelerinizi kolayca planlayın.</p>
      </div>
      <div className="grid gap-3">
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('google')}>
          <Chrome className="h-4 w-4" /> Google ile kayıt ol
        </Button>
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('github')}>
          <Github className="h-4 w-4" /> GitHub ile kayıt ol
        </Button>
        <Button variant="secondary" className="w-full" type="button" onClick={() => handleOAuth('apple')}>
          <Apple className="h-4 w-4" /> Apple ile kayıt ol
        </Button>
      </div>
      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-gray-200"></span>
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:bg-surface-dark">
          veya e-posta ile
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
            Adınız Soyadınız
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn. Ayşe Yılmaz"
              className="pl-11"
              required
            />
          </div>
        </div>
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
              placeholder="En az 6 karakter"
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
        </div>
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        {success && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{success}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Hesabınız var mı?{' '}
        <Link href="/auth/login" className="font-semibold text-accent">
          Giriş yapın
        </Link>
      </p>
    </div>
  )
}
