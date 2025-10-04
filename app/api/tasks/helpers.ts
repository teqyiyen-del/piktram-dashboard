import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase-types'
import { COMPLETED_STATUSES, getStatusLabel, normalizeStatus } from '@/lib/task-status'
import { TaskStatus } from '@/lib/types'

type Supabase = SupabaseClient<Database>

export async function updateProjectProgress(supabase: Supabase, projectId: string | null, userId: string) {
  if (!projectId) return

  const { data: projectTasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (!projectTasks) return

  const total = projectTasks.length
  const completed = projectTasks.filter((task) =>
    COMPLETED_STATUSES.includes(normalizeStatus(task.status as TaskStatus))
  ).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  await supabase.from('projects').update({ progress }).eq('id', projectId).eq('user_id', userId)
}

export async function createRevision(
  supabase: Supabase,
  {
    taskId,
    userId,
    description,
    commentId
  }: { taskId: string; userId: string; description: string; commentId?: string | null }
) {
  const { data } = await supabase
    .from('revisions')
    .insert({
      task_id: taskId,
      user_id: userId,
      description,
      comment_id: commentId ?? null
    })
    .select('id, task_id, user_id, comment_id, description, created_at, profiles(full_name, email)')
    .single()

  if (!data) return null

  const { profiles, ...rest } = data

  return {
    ...rest,
    author: {
      full_name: (profiles as { full_name: string | null } | null)?.full_name ?? null,
      email: (profiles as { email: string | null } | null)?.email ?? null
    }
  }
}

export async function createStatusRevision(
  supabase: Supabase,
  {
    taskId,
    userId,
    fromStatus,
    toStatus
  }: { taskId: string; userId: string; fromStatus: TaskStatus | null; toStatus: TaskStatus }
) {
  const normalizedFrom = fromStatus ? normalizeStatus(fromStatus) : null
  const normalizedTo = normalizeStatus(toStatus)

  if (normalizedFrom === normalizedTo) return

  const description = `Durum ${normalizedFrom ? getStatusLabel(normalizedFrom) : 'Belirsiz'} aşamasından ${getStatusLabel(
    normalizedTo
  )} aşamasına güncellendi.`

  await createRevision(supabase, {
    taskId,
    userId,
    description
  })
}
