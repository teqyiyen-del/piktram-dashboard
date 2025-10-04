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
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">
          İçerik Kütüphanesi (Admin)
        </h1>
        <p className="mt-1 text-sm text-white/90">
          Marka ekiplerinin yüklediği dosyaları yönetin ve yenilerini ekleyin.
        </p>
      </header>

      {/* Client component */}
      <AdminContentLibraryClient initialAssets={initialAssets} />
    </div>
  )
}
