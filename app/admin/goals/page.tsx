'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'

export default function GoalsPage() {
  const supabase = createClientComponentClient<Database>()
  const [goals, setGoals] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    setGoals(data || [])
  }

  async function createGoal() {
    if (!title.trim()) return
    setLoading(true)
    const { error } = await supabase.from('goals').insert([
      {
        title,
        description,
        due_date: dueDate || null,
        is_completed: false
      }
    ])
    setLoading(false)
    if (!error) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setShowModal(false)
      fetchGoals()
    } else {
      alert('Hedef eklenemedi: ' + error.message)
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    await supabase.from('goals').update({ is_completed: !current }).eq('id', id)
    fetchGoals()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hedefler</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          + Yeni Hedef
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`rounded-lg border p-4 shadow-sm ${
              goal.is_completed ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">
                {goal.title}{' '}
                {goal.is_completed && (
                  <span className="ml-2 text-xs text-green-600">✔</span>
                )}
              </h3>
              <span className="text-xs text-gray-500">
                {goal.due_date ? formatDate(goal.due_date) : 'Tarih yok'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{goal.description ?? 'Açıklama yok'}</p>
            <button
              onClick={() => toggleComplete(goal.id, goal.is_completed)}
              className="mt-2 text-xs font-medium text-accent hover:underline"
            >
              {goal.is_completed ? 'Tamamlandı → Geri Al' : 'Tamamla'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Yeni Hedef Ekle</h2>
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
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={createGoal}
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
