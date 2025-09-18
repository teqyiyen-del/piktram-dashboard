'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { FolderKanban, PlusCircle } from 'lucide-react'
import KanbanBoard from '@/components/tasks/kanban-board'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  company: string | null
}

type Task = Database['public']['Tables']['tasks']['Row']

export default function AdminTasksPage() {
  const supabase = createClientComponentClient<Database>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchTasks()
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, company')
    setClients(data || [])
  }

  async function fetchTasks(clientId?: string | null) {
    let query = supabase
      .from('tasks')
      .select('*, profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('user_id', clientId)

    const { data } = await query
    setTasks(data || [])
  }

  async function createTask() {
    if (!title.trim() || !selectedClient) {
      alert('Başlık ve müşteri seçimi zorunlu.')
      return
    }
    setLoading(true)

    let fileUrl: string | null = null
    if (file) {
      const { data, error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(`tasks/${Date.now()}-${file.name}`, file)

      if (uploadError) {
        setLoading(false)
        alert('Dosya yüklenemedi: ' + uploadError.message)
        return
      }
      fileUrl = data?.path || null
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          due_date: dueDate || null,
          priority,
          user_id: selectedClient,
          file_url: fileUrl,
          status: 'todo',
        },
      ])
      .select('*')
      .single()

    setLoading(false)
    if (!error && data) {
      setTasks((prev) => [data, ...prev])
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setFile(null)
      setShowModal(false)
    } else {
      alert('Görev eklenemedi: ' + error?.message)
    }
  }

  // ✅ Drag & Drop sonrası güncelleme
  async function handleTaskMove(taskId: string, newStatus: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .select('*')
      .single()

    if (!error && data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      )

      // ✅ Bildirim kaydı at
      await supabase.from('notifications').insert({
        title: 'Görev Güncellendi',
        description: `"${data.title}" görevi ${newStatus} durumuna taşındı.`,
        type: 'task',
        user_id: data.user_id,
        meta: { task_id: data.id },
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <FolderKanban className="h-6 w-6" />
            Görevler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Tüm görevlerinizi yönetin, düzenleyin veya yeni görevler ekleyin.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Görev
        </Button>
      </header>

      {/* Filter + Kanban Board */}
      <Card title="Görev Listesi" description="Panelde kayıtlı tüm görevleri görüntüleyin.">
        <div className="flex items-center justify-between mb-6">
          <select
            value={selectedClient ?? ''}
            onChange={(e) => {
              setSelectedClient(e.target.value || null)
              fetchTasks(e.target.value || null)
            }}
            className="w-64 rounded-md border px-2 py-1"
          >
            <option value="">Tümü</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
              </option>
            ))}
          </select>
        </div>

        <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Görev Ekle"
      >
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama"
          />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full rounded-md border px-2 py-1"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>

          <select
            value={selectedClient ?? ''}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full rounded-md border px-2 py-1"
          >
            <option value="">Müşteri seçin</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
              </option>
            ))}
          </select>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-md border px-2 py-1"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button
              onClick={createTask}
              disabled={loading}
              className="bg-[#FF5E4A] hover:bg-[#FA7C6B] text-white"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
