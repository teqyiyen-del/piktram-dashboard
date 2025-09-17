import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Eğer kullanıcı giriş yaptıysa ana sayfaya yönlendir
  if (session) {
    redirect('/anasayfa')
    // Eğer anasayfa yerine dashboard istersen burayı:
    // redirect('/dashboard')
  }

  // Giriş yapmamış kullanıcıya login ekranı göster
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">Tekrar hoş geldiniz</h2>
        <p className="text-sm text-gray-500">
          Görevlerinizi yönetmek için hesabınıza giriş yapın.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
