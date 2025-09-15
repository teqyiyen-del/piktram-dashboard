'use client'

import { useState, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase-types'

interface TaskFormProps {
  onSuccess: () => void
  projects: { id: string; title: string }[]
  initialData?: Task
}

export function TaskForm({ onSuccess, projects, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState<Task['status']>(initialData?.status ?? 'todo')
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [projectId, setProjectId] = useState(initialData?.project_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialData?.attachment_url ?? null)
  const supabase = useSupabaseClient<Database>()

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

      const response = await fetch(initialData ? `/api/tasks/${initialData.id}` : '/api/tasks', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      onSuccess()
    } catch (uploadError) {
      setLoading(false)
      setError(uploadError instanceof Error ? uploadError.message : 'Bir hata oluştu')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Görev Başlığı</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Tasarım incelemesi" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Görevin detayları"
        ></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
            <option value="todo">Yapılacak</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="done">Tamamlandı</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Öncelik</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bitiş Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">İlişkili Proje</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dosya Eki</label>
        <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        {file && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Seçilen dosya: {file.name}</p>}
        {attachmentUrl && !file && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent">
              Mevcut eki görüntüle
            </a>
            <button type="button" className="text-red-500" onClick={() => setAttachmentUrl(null)}>
              Kaldır
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Görevi Güncelle' : 'Görev Oluştur'}
      </Button>
    </form>
  )
}
