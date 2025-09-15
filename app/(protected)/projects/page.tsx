import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { ProjectsClient } from '@/components/projects/projects-client'

export default async function ProjectsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('due_date', { ascending: true })

  return <ProjectsClient initialProjects={projectsData ?? []} />
}
