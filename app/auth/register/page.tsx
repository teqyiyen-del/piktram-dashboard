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

  if (session) {
<<<<<<< HEAD
    redirect('/anasayfa')
  }

  return <RegisterForm />
=======
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">Yeni hesap oluştur</h2>
        <p className="text-sm text-gray-500">Piktram ile projelerinizi kolayca planlayın.</p>
      </div>
      <RegisterForm />
    </div>
  )
>>>>>>> codex-restore-ux
}
