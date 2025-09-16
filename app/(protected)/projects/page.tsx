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

<<<<<<< HEAD
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const query = supabase
    .from('projects')
    .select('*')
    .order('due_date', { ascending: true })

  if (!isAdmin) {
    query.eq('user_id', session.user.id)
  }

  const { data: projectsData } = await query

=======
  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('due_date', { ascending: true })

>>>>>>> codex-restore-ux
  return <ProjectsClient initialProjects={projectsData ?? []} />
}
