import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { ContentLibraryClient } from '@/components/content-library/content-library-client'
import { SectionHeader } from '@/components/layout/section-header'
import type { StoredFile } from '@/lib/types'

type AssetCategory = 'logo' | 'post' | 'reel' | 'visual'
const ASSET_CATEGORIES: AssetCategory[] = ['logo', 'post', 'reel', 'visual']

export default async function IcerikKutuphanePage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let assetsQuery = supabase
    .from('files')
    .select('*')
    .in('category', ASSET_CATEGORIES)
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    assetsQuery = assetsQuery.eq('user_id', session.user.id)
  }

  const { data: assetsData } = await assetsQuery

  const grouped: Record<AssetCategory, StoredFile[]> = {
    logo: [],
    post: [],
    reel: [],
    visual: []
  }

  for (const asset of assetsData ?? []) {
    const category = asset.category as AssetCategory
    if (ASSET_CATEGORIES.includes(category)) {
      grouped[category].push(asset as unknown as StoredFile)
    }
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        title="İçerik Kütüphanesi"
        subtitle="Logo, post, reel ve görsellerinizi tek yerden yönetin."
        badge="Varlık Yönetimi"
        gradient
      />

      <ContentLibraryClient initialAssets={grouped} />
    </div>
  )
}
