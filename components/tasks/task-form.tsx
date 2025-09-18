'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Task, TaskStatus } from '@/lib/types'
import { TASK_STATUS_ORDER, getStatusLabel, normalizeStatus } from '@/lib/task-status'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase-types'
import { useNotificationCenter } from '@/components/providers/notification-provider'
import { useToast } from '@/components/providers/toast-provider'

interface TaskFormProps {
  onSuccess: (task: Task) => void
  projects: { id: string; title: string }[]
  initialData?: Task
}

function TaskForm({ onSuccess, projects, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(
    initialData ? normalizeStatus(initialData.status) : 'yapiliyor'
  )
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [projectId, setProjectId] = useState(initialData?.project_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialData?.attachment_url ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = useSupabaseClient<Database>()
  const { refresh: refreshNotifications } = useNotificationCenter()
  const { toast } = useToast()

  // File preview
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const currentPreview = useMemo(
    () =>
      previewUrl ??
      (attachmentUrl && attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? attachmentUrl : null),
    [previewUrl, attachmentUrl]
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Görev başlığı gerekli')
      toast({
        title: 'İşlem başarısız',
        description: 'Görev başlığı gerekli.',
        variant: 'error'
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      let uploadedUrl = attachmentUrl

      // Upload file if new selected
      if (file) {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Oturum bulunamadı')

        const path = `user-${user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(path, file, { cacheControl: '3600', upsert: true })

        if (uploadError) throw new Error('Dosya yüklenemedi')

        const { data: publicUrlData } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(path)
        uploadedUrl = publicUrlData.publicUrl
      }

      // API request
      const response = await fetch(initialData ? `/api/tasks/${initialData.id}` : '/api/tasks', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() ? description.trim() : null,
          status,
          priority,
          due_date: dueDate || null,
          project_id: projectId || null,
          attachment_url: uploadedUrl
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        toast({
          title: 'İşlem başarısız',
          description: data.error ?? 'Görev kaydedilemedi.',
          variant: 'error'
        })
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

      setFile(null)
      onSuccess(normalizedTask)
      void refreshNotifications()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Görev kaydedilemedi.'
      setError(message)
      toast({ title: 'İşlem başarısız', description: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... aynı form alanları ... */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Görevi Güncelle' : 'Görev Oluştur'}
      </Button>
    </form>
  )
}

export default TaskForm   // ✅ artık default export
