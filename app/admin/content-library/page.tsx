import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase-types'
import { AdminContentLibraryClient } from '@/components/content-library/admin-content-library-client'

export default async function ContentLibraryAdminPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // --- eş zamanlı fetch ---
  const { data: files } = await supabase.from('files').select('*')

  const initialAssets = {
    logo: files?.filter(f => f.category === 'logo') ?? [],
    post: files?.filter(f => f.category === 'post') ?? [],
    reel: files?.filter(f => f.category === 'reel') ?? [],
    visual: files?.filter(f => f.category === 'visual') ?? []
  }

  return (
    <div className="space-y-8">
      {/* Admin başlığı */}
      <header className="rounded-3xl bg-surface p-8 shadow-sm dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          İçerik Kütüphanesi (Admin)
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Marka ekiplerinin yüklediği dosyaları yönetin ve yenilerini ekleyin.
        </p>
      </header>

      {/* Client component (dosya listeleme + yükleme modalı) */}
      <AdminContentLibraryClient initialAssets={initialAssets} />
    </div>
  )
}
