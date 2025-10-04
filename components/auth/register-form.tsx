'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Building2, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

const registerErrors: Record<string, string> = {
  'User already registered': 'Bu e-posta adresi ile daha önce kayıt yapılmış. Lütfen giriş yapın.',
  'Password should be at least 6 characters': 'Parolanız en az 6 karakter olmalıdır.',
  'Database error saving new user': 'Kayıt sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.',
  default: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
}

export function RegisterForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
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
        data: { full_name: fullName, company }
      }
    })

    if (error) {
      setError(translateError(error.message))
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        company,
        email,
        role: 'müşteri'
      })
    }

    setLoading(false)

    if (data.session) {
      router.replace('/anasayfa')
    } else {
      setSuccess('Kayıt başarılı! Lütfen e-posta kutunuzu kontrol ederek hesabınızı doğrulayın.')
    }
  }

  const handleOAuth = async () => {
    setError(null)
    setSuccess(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) setError(translateError(error.message))
  }

  return (
    <div className="space-y-6 text-center">
      {/* Başlık */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hesap Oluştur!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Piktram ile şirketinizi kolayca yönetin.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn. Ayşe Yılmaz"
              className="w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm shadow-sm focus:border-[#FF5E4A] focus:ring-2 focus:ring-[#FF5E4A]/20 transition"
              required
            />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Şirket Adı</label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Örn. Piktram Creative"
              className="w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm shadow-sm focus:border-[#FF5E4A] focus:ring-2 focus:ring-[#FF5E4A]/20 transition"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresi</label>
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

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parola</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
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
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button
          type="submit"
          className="w-full rounded-xl bg-[#FF5E4A] hover:bg-[#fa6a56] text-white font-medium shadow-md transition"
          disabled={loading}
        >
          {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-gray-200"></span>
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:bg-surface-dark">
          veya
        </span>
      </div>

      {/* Google Register */}
      <Button
        variant="outline"
        className="w-full rounded-xl border-gray-300 hover:bg-gray-50 transition"
        type="button"
        onClick={handleOAuth}
      >
        <Chrome className="h-4 w-4 text-[#FF5E4A]" />
        <span className="ml-2 font-medium text-gray-700">Google ile kayıt ol</span>
      </Button>

      <p className="text-sm text-gray-500">
        Hesabınız var mı?{' '}
        <Link href="/auth/login" className="font-semibold text-[#FF5E4A] hover:underline">
          Giriş yapın
        </Link>
      </p>
    </div>
  )
}
