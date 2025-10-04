import { TaskStatus } from './types'

export const TASK_STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'revision',
  'approved',
  'published',
  'tamamlandi' // ✅ artık burada doğru şekilde
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Beklemede',
  in_progress: 'Yapılıyor',
  in_review: 'Onay Sürecinde',
  revision: 'Revize',
  approved: 'Onaylandı',
  published: 'Paylaşıldı',
  tamamlandi: 'Tamamlandı' // ✅ label eşleşti
}

export const COMPLETED_STATUSES: TaskStatus[] = ['approved', 'published', 'tamamlandi']

export function normalizeStatus(status: TaskStatus): TaskStatus {
  if (status === 'completed' || status === 'done') {
    // DB’den completed/done gelse bile frontend'te "tamamlandi" yapıyoruz
    return 'tamamlandi'
  }
  if (!TASK_STATUS_ORDER.includes(status)) {
    return 'todo'
  }
  return status
}

export function getStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABELS[status] ?? status
}
