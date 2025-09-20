import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { RegisterForm } from '@/components/auth/register-form'

export default async function RegisterPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Kullanıcı zaten giriş yaptıysa anasayfaya yönlendir
  if (session) {
    redirect('/anasayfa')
    // Alternatif olarak:
    // redirect('/dashboard')
  }

  // Giriş yapılmamışsa kayıt ekranı göster
  return (
    <div className="space-y-6">
      <RegisterForm />
    </div>
  )
}
