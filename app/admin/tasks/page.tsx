// app/(admin)/tasks/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'

export default function TasksPage() {
  const supabase = createClientComponentClient<Database>()
  const [tasks, setTasks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    setTasks(data || [])
  }

  async function createTask() {
    if (!title.trim()) return
    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      { title, description, due_date: dueDate || null, priority }
    ])
    setLoading(false)
    if (!error) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setShowModal(false)
      fetchTasks()
    } else {
      alert('Görev eklenemedi: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Görevler</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          + Yeni Görev
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <span className="text-xs text-gray-500">
                {task.due_date ? formatDate(task.due_date) : 'Tarih yok'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{task.description}</p>
            <span className="text-xs text-accent">Öncelik: {task.priority}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Yeni Görev Ekle</h2>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlık"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Açıklama"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={createTask}
                  disabled={loading}
                  className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
