'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { CheckSquare, PlusCircle } from 'lucide-react' // 🔑 iconu değiştirdim
import KanbanBoard from '@/components/tasks/kanban-board'
import { useCustomer } from '@/components/providers/customer-provider'

type Task = Database['public']['Tables']['tasks']['Row']

function sanitizeFileName(name: string) {
  return name.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export default function AdminTasksPage() {
  const supabase = createClientComponentClient<Database>()
  const { selectedCustomer } = useCustomer()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    let query = supabase.from('tasks').select('*').order('id', { ascending: false })

    // sadece tek müşteri seçilirse filtre uygula
    if (selectedCustomer && selectedCustomer !== 'all') {
      query = query.eq('user_id', selectedCustomer)
    }

    const { data, error } = await query
    if (error) {
      console.error('Görevler alınamadı:', error.message)
      setTasks([])
      return
    }
    setTasks((data ?? []) as Task[])
  }, [supabase, selectedCustomer])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function createTask() {
    if (!title.trim()) return alert('Başlık zorunlu.')
    if (!selectedCustomer || selectedCustomer === 'all')
      return alert('Görev eklemek için müşteri seçmelisiniz.')

    setLoading(true)
    let filePath: string | null = null
    if (file) {
      const safe = sanitizeFileName(file.name)
      const { data, error: upErr } = await supabase.storage
        .from('task-files')
        .upload(`tasks/${Date.now()}-${safe}`, file)
      if (upErr) {
        setLoading(false)
        return alert('Dosya yüklenemedi: ' + upErr.message)
      }
      filePath = data?.path || null
    }

    const { error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description,
        due_date: dueDate || null,
        priority,
        file_url: filePath,
        status: 'todo',
        user_id: selectedCustomer
      }])

    setLoading(false)
    if (error) return alert('Görev eklenemedi: ' + error.message)

    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    setFile(null)
    setShowModal(false)
    await fetchTasks()
  }

  async function handleTaskMove(taskId: string, newStatus: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) throw error
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } as Task : t)
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-6 w-6" /> {/* 🔑 icon değişti */}
            Görevler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            {selectedCustomer === null || selectedCustomer === ''
              ? 'Müşteri seçiniz'
              : selectedCustomer === 'all'
                ? 'Tüm müşterilerin görevleri'
                : 'Seçilen müşteri için görevler'}
          </p>
        </div>
        {/* Görev ekleme sadece tek müşteri seçilince aktif */}
        {selectedCustomer && selectedCustomer !== 'all' && (
          <Button
            onClick={() => setShowModal(true)}
            className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
          >
            <PlusCircle className="h-4 w-4" />
            Yeni Görev
          </Button>
        )}
      </header>

      <Card>
        {selectedCustomer === null || selectedCustomer === '' ? (
          <p className="text-center text-gray-500 p-6">
            Görevleri görmek için müşteri seçiniz.
          </p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onRefresh={fetchTasks}
          />
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yeni Görev Ekle">
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
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
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-md border px-2 py-1"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
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
