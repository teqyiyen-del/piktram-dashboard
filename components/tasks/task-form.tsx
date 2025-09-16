'use client'

<<<<<<< HEAD
import Image from 'next/image'
import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase-types'
import { useNotificationCenter } from '@/components/providers/notification-provider'

interface TaskFormProps {
  onSuccess: (message?: string) => void
=======
import { useState, FormEvent } from 'react'
import { Task } from '@/lib/types'
import { useToast } from '@/components/providers/toast-provider'
import { normalizeStatus, TASK_STATUS_ORDER, getStatusLabel } from '@/lib/task-status'
import { Button } from '@/components/ui/button'

interface TaskFormProps {
  onSuccess: (task: Task) => void
>>>>>>> codex-restore-ux
  projects: { id: string; title: string }[]
  initialData?: Task
}

export function TaskForm({ onSuccess, projects, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
<<<<<<< HEAD
  const [status, setStatus] = useState<Task['status']>(initialData?.status ?? 'yapiliyor')
=======
  const [status, setStatus] = useState<Task['status']>(initialData ? normalizeStatus(initialData.status) : 'todo')
>>>>>>> codex-restore-ux
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [projectId, setProjectId] = useState(initialData?.project_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
<<<<<<< HEAD
  const [file, setFile] = useState<File | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialData?.attachment_url ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const supabase = useSupabaseClient<Database>()
  const { refresh: refreshNotifications } = useNotificationCenter()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const currentPreview = useMemo(() => previewUrl ?? (attachmentUrl && attachmentUrl.match(/(jpg|jpeg|png|gif|webp)$/i) ? attachmentUrl : null), [previewUrl, attachmentUrl])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let uploadedUrl = attachmentUrl

      if (file) {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Oturum bulunamadı')
        }

        const path = `user-${user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('task-attachments').upload(path, file, {
          cacheControl: '3600',
          upsert: true
        })

        if (uploadError) {
          throw new Error('Dosya yüklenemedi')
        }

        const { data: publicUrlData } = supabase.storage.from('task-attachments').getPublicUrl(path)
        uploadedUrl = publicUrlData.publicUrl
      }

=======
  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Görev başlığı gerekli')
      toast({ title: 'İşlem başarısız', description: 'Görev başlığı gerekli.', variant: 'error' })
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null,
      status,
      priority,
      due_date: dueDate ? dueDate : null,
      project_id: projectId || null
    }

    try {
>>>>>>> codex-restore-ux
      const response = await fetch(initialData ? `/api/tasks/${initialData.id}` : '/api/tasks', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
<<<<<<< HEAD
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          due_date: dueDate,
          project_id: projectId || null,
          attachment_url: uploadedUrl
        })
      })

      setLoading(false)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        return
      }

      setFile(null)
      onSuccess(initialData ? 'Görev başarıyla güncellendi' : 'Yeni görev oluşturuldu')
      void refreshNotifications()
    } catch (uploadError) {
      setLoading(false)
      setError(uploadError instanceof Error ? uploadError.message : 'Bir hata oluştu')
=======
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        toast({ title: 'İşlem başarısız', description: data.error ?? 'Görev kaydedilemedi.', variant: 'error' })
        return
      }

      const data = (await response.json()) as Task
      const normalizedTask = { ...data, status: normalizeStatus(data.status) }

      toast({
        title: initialData ? 'Görev güncellendi' : 'Görev oluşturuldu',
        description: initialData
          ? 'Görev bilgileri başarıyla kaydedildi.'
          : 'Yeni göreviniz panoya eklendi.',
        variant: 'success'
      })
      onSuccess(normalizedTask)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Görev kaydedilemedi.'
      setError(message)
      toast({ title: 'İşlem başarısız', description: message, variant: 'error' })
    } finally {
      setLoading(false)
>>>>>>> codex-restore-ux
    }
  }

  return (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label>Görev Başlığı</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Tasarım incelemesi" required />
        </div>
        <div className="sm:col-span-2">
          <label>Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Görevin detayları"
          ></textarea>
        </div>
        <div>
          <label>Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {TASK_STATUS_ORDER.map((option) => (
              <option key={option} value={option}>
                {TASK_STATUS_LABELS[option]}
=======
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Görev Başlığı</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Tasarım incelemesi" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Görevin detayları"></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
            {TASK_STATUS_ORDER.map((taskStatus) => (
              <option key={taskStatus} value={taskStatus}>
                {getStatusLabel(taskStatus)}
>>>>>>> codex-restore-ux
              </option>
            ))}
          </select>
        </div>
        <div>
<<<<<<< HEAD
          <label>Öncelik</label>
=======
          <label className="text-sm font-medium text-gray-700">Öncelik</label>
>>>>>>> codex-restore-ux
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
<<<<<<< HEAD
        <div>
          <label>Bitiş Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label>İlişkili Proje</label>
=======
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">İlişkili Proje</label>
>>>>>>> codex-restore-ux
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
<<<<<<< HEAD
        <div className="sm:col-span-2 space-y-3">
          <label>Dosya Eki</label>
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          {currentPreview && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-300">Ön izleme</p>
              <Image
                src={currentPreview}
                alt="Ek ön izlemesi"
                width={720}
                height={480}
                unoptimized
                className="max-h-48 w-full rounded-xl object-cover"
              />
            </div>
          )}
          {file && <p className="text-xs text-gray-500 dark:text-gray-400">Seçilen dosya: {file.name}</p>}
          {attachmentUrl && !file && !currentPreview && (
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
                Mevcut eki görüntüle
              </a>
              <button type="button" className="text-red-500" onClick={() => setAttachmentUrl(null)}>
                Kaldır
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
=======
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
>>>>>>> codex-restore-ux
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Görevi Güncelle' : 'Görev Oluştur'}
      </Button>
    </form>
  )
}
