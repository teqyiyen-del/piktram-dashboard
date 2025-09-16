'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Task, Comment, Revision } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatDateTime, formatDate } from '@/lib/utils'
import { getStatusLabel, normalizeStatus, TASK_STATUS_ORDER } from '@/lib/task-status'
import { TaskForm } from './task-form'
import { useToast } from '@/components/providers/toast-provider'

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
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

export function TaskDetails({ task, projects, onClose, onTaskUpdated }: TaskDetailsProps) {
  const [currentTask, setCurrentTask] = useState<Task>(task)
  const [comments, setComments] = useState<Comment[]>([])
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [status, setStatus] = useState(normalizeStatus(task.status))
  const [statusLoading, setStatusLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
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
        fetch(`/api/tasks/${task.id}/revisions`)
      ])

      if (commentsRes.ok) {
        const data = (await commentsRes.json()) as Comment[]
        setComments(data)
      } else {
        const error = await commentsRes.json()
        toast({
          title: 'Yorumlar yüklenemedi',
          description: error.error ?? 'Beklenmedik bir hata oluştu.',
          variant: 'error'
        })
        setComments([])
      }

      if (revisionsRes.ok) {
        const data = (await revisionsRes.json()) as Revision[]
        setRevisions(data)
      } else {
        const error = await revisionsRes.json()
        toast({
          title: 'Revize geçmişi yüklenemedi',
          description: error.error ?? 'Beklenmedik bir hata oluştu.',
          variant: 'error'
        })
        setRevisions([])
      }
    } catch (error) {
      toast({
        title: 'Detaylar yüklenemedi',
        description: error instanceof Error ? error.message : 'Beklenmedik bir hata oluştu.',
        variant: 'error'
      })
      setComments([])
      setRevisions([])
    } finally {
      setIsLoading(false)
    }
  }, [task.id, toast])

  useEffect(() => {
    setCurrentTask(task)
    setStatus(normalizeStatus(task.status))
  }, [task])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  const handleAddComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed) return
    setIsCommentLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Yorum eklenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }

      const data = (await response.json()) as CommentResponse
      setComments((prev) => [...prev, data.comment])
      if (data.revision) {
        setRevisions((prev) => [data.revision, ...prev])
      }
      setCommentText('')
      toast({ title: 'Yorum paylaşıldı', description: 'Görevin revize geçmişine eklendi.', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Yorum eklenemedi',
        description: error instanceof Error ? error.message : 'Beklenmedik bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setIsCommentLoading(false)
    }
  }

  const handleStatusChange = async (nextStatus: Task['status']) => {
    if (statusLoading) return
    const normalizedNext = normalizeStatus(nextStatus)
    const previousStatus = status
    setStatus(normalizedNext)
    setStatusLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Durum güncellenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        setStatus(previousStatus)
        return
      }

      const updatedTask = (await response.json()) as Task
      const normalizedUpdated = normalizeStatus(updatedTask.status)
      const nextTask = { ...updatedTask, status: normalizedUpdated }
      setCurrentTask(nextTask)
      setStatus(normalizedUpdated)
      onTaskUpdated(nextTask)
      toast({
        title: 'Durum güncellendi',
        description: `${getStatusLabel(normalizedUpdated)} aşamasına taşındı.`,
        variant: 'success'
      })
      loadDetails()
    } catch (error) {
      toast({
        title: 'Durum güncellenemedi',
        description: error instanceof Error ? error.message : 'Beklenmedik bir hata oluştu.',
        variant: 'error'
      })
      setStatus(previousStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <TaskForm
          initialData={currentTask}
          projects={projects}
          onSuccess={(updatedTask) => {
            setIsEditing(false)
            setCurrentTask(updatedTask)
            setStatus(normalizeStatus(updatedTask.status))
            onTaskUpdated(updatedTask)
            loadDetails()
          }}
        />
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentTask.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{currentTask.description}</p>
              </div>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Görevi Düzenle
              </Button>
            </div>
            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Durum</h4>
              <span className="text-xs text-gray-500">{getStatusLabel(status)}</span>
            </div>
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

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Yorumlar</h4>
            {isLoading ? (
              <p className="text-sm text-gray-500">Yorumlar yükleniyor...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz yorum yapılmamış. İlk yorumu sen ekle.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{comment.author?.full_name ?? comment.author?.email ?? 'Kullanıcı'}</span>
                      <span>{formatDateTime(comment.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-gray-300 p-4">
              <textarea
                rows={3}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Görev ile ilgili güncel durum ya da not ekleyin"
                className="w-full resize-none bg-white"
              ></textarea>
              <Button className="mt-3" onClick={handleAddComment} disabled={isCommentLoading}>
                {isCommentLoading ? 'Gönderiliyor...' : 'Yorumu Paylaş'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Revize Geçmişi</h4>
            {isLoading ? (
              <p className="text-sm text-gray-500">Geçmiş yükleniyor...</p>
            ) : revisions.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz revize geçmişi bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {revisions.map((revision) => (
                  <div key={revision.id} className="rounded-2xl border border-gray-200 bg-white p-3">
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

          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
