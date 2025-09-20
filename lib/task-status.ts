import { TaskStatus } from './types'

export const TASK_STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'revision',
  'approved',
  'published'
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Beklemede',
  in_progress: 'Yapılıyor',
  in_review: 'Onay Sürecinde',
  revision: 'Revize',
  approved: 'Onaylandı',
  published: 'Paylaşıldı',
  done: 'Tamamlandı'
}

export const COMPLETED_STATUSES: TaskStatus[] = ['approved', 'published', 'done']

export function normalizeStatus(status: TaskStatus): TaskStatus {
  if (status === 'done') {
    return 'approved'
  }
  if (!TASK_STATUS_ORDER.includes(status)) {
    return 'todo'
  }
  return status
}

export function getStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABELS[status] ?? status
}
