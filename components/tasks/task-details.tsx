'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Task, Comment, Revision } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatDateTime, formatDate } from '@/lib/utils'
import { getStatusLabel, normalizeStatus, TASK_STATUS_ORDER } from '@/lib/task-status'
import { useToast } from '@/components/providers/toast-provider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { X } from 'lucide-react' // ✅ ikon

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
}

interface TaskDetailsProps {
  task: Task
  projects: { id: string; title: string }[]
  onClose: () => void
  onTaskUpdated: (task: Task) => void
}

interface CommentResponse {
  comment: Comment
  revision: Revision | null
}

function TaskDetails({ task, projects, onClose, onTaskUpdated }: TaskDetailsProps) {
  const supabase = createClientComponentClient<Database>()
  const [currentTask, setCurrentTask] = useState<Task>(task)
  const [comments, setComments] = useState<Comment[]>([])
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentFile, setCommentFile] = useState<File | null>(null)
  const [status, setStatus] = useState(normalizeStatus(task.status))
  const [statusLoading, setStatusLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const projectName = useMemo(() => {
    if (!currentTask.project_id) return 'Proje atanmamış'
    return projects.find((project) => project.id === currentTask.project_id)?.title ?? 'Proje bulunamadı'
  }, [currentTask.project_id, projects])

  const loadDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const [commentsRes, revisionsRes] = await Promise.all([
        fetch(`/api/tasks/${task.id}/comments`),
        fetch(`/api/tasks/${task.id}/revisions`),
      ])

      if (commentsRes.ok) {
        const data = (await commentsRes.json()) as Comment[]
        setComments(data)
      }

      if (revisionsRes.ok) {
        const data = (await revisionsRes.json()) as Revision[]
        setRevisions(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [task.id])

  useEffect(() => {
    setCurrentTask(task)
    setStatus(normalizeStatus(task.status))
  }, [task])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  const handleAddComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed && !commentFile) return
    setIsCommentLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', trimmed)
      if (commentFile) formData.append('file', commentFile)

      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Yorum eklenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }

      const data = (await response.json()) as CommentResponse
      setComments((prev) => [...prev, data.comment])
      if (data.revision) setRevisions((prev) => [data.revision, ...prev])

      setCommentText('')
      setCommentFile(null)
      toast({ title: 'Yorum paylaşıldı', description: 'Görevin revize geçmişine eklendi.', variant: 'success' })
    } finally {
      setIsCommentLoading(false)
    }
  }

  const handleStatusChange = async (nextStatus: Task['status']) => {
    if (statusLoading) return
    const normalizedNext = normalizeStatus(nextStatus)
    const prevStatus = status
    setStatus(normalizedNext)
    setStatusLoading(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        setStatus(prevStatus)
        return
      }

      const updatedTask = (await response.json()) as Task
      const normalizedUpdated = normalizeStatus(updatedTask.status)
      const nextTask = { ...updatedTask, status: normalizedUpdated }
      setCurrentTask(nextTask)
      setStatus(normalizedUpdated)
      onTaskUpdated(nextTask)
      loadDetails()
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative h-[80vh] w-[90vw] max-w-5xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">
        
        {/* X kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-2 hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
        >
          <X size={20} />
        </button>

        {/* Sol panel */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{currentTask.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{currentTask.description}</p>
            </div>
            <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-gray-500">Proje</p>
                <p className="font-medium text-gray-900">{projectName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Teslim Tarihi</p>
                <p className="font-medium text-gray-900">{formatDate(currentTask.due_date) || 'Belirlenmedi'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Öncelik</p>
                <p className="font-medium text-gray-900">{priorityLabels[currentTask.priority]}</p>
              </div>
            </div>
          </div>

          {/* Durum */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Durum</h4>
            <div className="flex flex-wrap gap-2">
              {TASK_STATUS_ORDER.map((taskStatus) => {
                const isActive = status === taskStatus
                return (
                  <button
                    key={taskStatus}
                    disabled={statusLoading}
                    onClick={() => handleStatusChange(taskStatus)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      isActive
                        ? 'bg-accent text-white shadow'
                        : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {getStatusLabel(taskStatus)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Revizyonlar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Revize Geçmişi</h4>
            {revisions.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz revize geçmişi bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{revision.author?.full_name ?? revision.author?.email ?? 'Kullanıcı'}</span>
                      <span>{formatDateTime(revision.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{revision.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ panel */}
        <div className="w-96 flex flex-col border-l p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Yorumlar</h4>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz yorum yok.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-gray-200 bg-white p-3 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{comment.author?.full_name ?? comment.author?.email ?? 'Kullanıcı'}</span>
                    <span>{formatDateTime(comment.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                  {comment.file_url && (
                    <img
                      src={comment.file_url}
                      alt="comment-attachment"
                      className="mt-2 max-h-32 rounded-lg border cursor-pointer hover:opacity-90"
                      onClick={() => setImagePreview(comment.file_url)}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Yorum ekleme */}
          <div className="border-t mt-3 pt-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorum yaz..."
              className="w-full resize-none rounded-md border px-2 py-1 text-sm"
            />

            <div className="mt-2 flex items-center gap-2">
              <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 transition">
                Dosya Seç
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCommentFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {commentFile && <span className="text-xs text-gray-500 truncate">{commentFile.name}</span>}
            </div>

            <Button className="mt-3 w-full" onClick={handleAddComment} disabled={isCommentLoading}>
              {isCommentLoading ? 'Gönderiliyor...' : 'Yorumu Paylaş'}
            </Button>
          </div>
        </div>
      </div>

      {/* Resim modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setImagePreview(null)}
        >
          <img src={imagePreview} alt="preview" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  )
}

export default TaskDetails
