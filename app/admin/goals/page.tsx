'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/components/providers/customer-provider'

export default function AdminGoalsPage() {
  const supabase = createClientComponentClient<Database>()
  const { selectedCustomer } = useCustomer()

  const [goals, setGoals] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCustomer) fetchGoals()
  }, [selectedCustomer])

  async function fetchGoals() {
    if (!selectedCustomer) return
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', selectedCustomer)
      .order('created_at', { ascending: false })

    if (error) console.error('Hedefler alınamadı:', error.message)
    setGoals(data || [])
  }

  async function saveGoal() {
    if (!title.trim()) {
      alert('Başlık zorunlu.')
      return
    }
    if (!selectedCustomer) {
      alert('Müşteri seçilmedi.')
      return
    }

    setLoading(true)

    if (editingGoal) {
      const { error } = await supabase
        .from('goals')
        .update({
          title,
          description,
          due_date: dueDate || null,
          progress,
          is_completed: progress === 100,
        })
        .eq('id', editingGoal.id)

      setLoading(false)
      if (error) {
        alert('Hedef güncellenemedi: ' + error.message)
      } else {
        resetForm()
        await fetchGoals()
      }
    } else {
      const { error } = await supabase.from('goals').insert([
        {
          title,
          description,
          due_date: dueDate || null,
          is_completed: progress === 100,
          progress,
          user_id: selectedCustomer,
        },
      ])

      setLoading(false)
      if (error) {
        alert('Hedef eklenemedi: ' + error.message)
      } else {
        resetForm()
        await fetchGoals()
      }
    }
  }

  async function updateProgress(id: string, newProgress: number) {
    // optimistic update
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: newProgress, is_completed: newProgress === 100 } : g
      )
    )

    const { error } = await supabase
      .from('goals')
      .update({
        progress: newProgress,
        is_completed: newProgress === 100,
      })
      .eq('id', id)

    if (error) {
      console.error('Progress güncellenemedi:', error.message)
    } else {
      await fetchGoals()
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    // optimistic update
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: current ? 0 : 100, is_completed: !current } : g
      )
    )

    const { error } = await supabase
      .from('goals')
      .update({ is_completed: !current, progress: !current ? 100 : 0 })
      .eq('id', id)

    if (error) {
      console.error('Tamamlama hatası:', error.message)
    } else {
      await fetchGoals()
    }
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) {
      alert('Hedef silinemedi: ' + error.message)
    } else {
      await fetchGoals()
    }
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setDueDate('')
    setProgress(0)
    setEditingGoal(null)
    setShowModal(false)
  }

  function openEdit(goal: any) {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || '')
    setDueDate(goal.due_date || '')
    setProgress(goal.progress || 0)
    setShowModal(true)
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
            Hedefler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Müşterilere özel hedefleri ekleyin ve yönetin.
          </p>
        </div>
        {selectedCustomer && (
          <Button
            onClick={() => setShowModal(true)}
            className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
          >
            <PlusCircle className="h-4 w-4" />
            Yeni Hedef
          </Button>
        )}
      </header>

      {/* Liste */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`rounded-lg border p-4 shadow-sm ${
              goal.is_completed ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{goal.title}</h3>
              <span className="text-xs text-gray-500">
                {goal.due_date ? formatDate(goal.due_date) : 'Tarih yok'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {goal.description ?? 'Açıklama yok'}
            </p>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (goal.progress || 0) === 100 ? 'bg-green-500' : 'bg-accent'
                  }`}
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{goal.progress || 0}%</span>
                {!goal.is_completed && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateProgress(
                          goal.id,
                          Math.min(100, (goal.progress || 0) + 10)
                        )
                      }
                      className="rounded-full bg-[#FF5E4A] px-3 py-1 text-xs font-medium text-white hover:bg-[#e24d3d]"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() =>
                        updateProgress(
                          goal.id,
                          Math.max(0, (goal.progress || 0) - 10)
                        )
                      }
                      className="rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600"
                    >
                      -10%
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => toggleComplete(goal.id, goal.is_completed)}
                className="rounded-full bg-[#FF5E4A] px-4 py-1 text-xs font-semibold text-white flex items-center gap-1 hover:bg-[#e24d3d]"
              >
                {goal.is_completed ? 'Geri Al' : 'Tamamla'}
              </button>
              <button
                onClick={() => openEdit(goal)}
                className="rounded-full bg-gray-500 px-4 py-1 text-xs font-semibold text-white flex items-center gap-1 hover:bg-gray-600"
              >
                <Pencil className="h-3 w-3" />
                Düzenle
              </button>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="rounded-full bg-gray-200 px-4 py-1 text-xs font-semibold text-black flex items-center gap-1 hover:bg-gray-300"
              >
                <Trash2 className="h-3 w-3" />
                Sil
              </button>
            </div>
          </div>
        ))}
        {goals.length === 0 && selectedCustomer && (
          <p className="text-sm text-gray-500">Henüz hedef bulunamadı.</p>
        )}
        {!selectedCustomer && (
          <p className="text-sm text-gray-500">
            Lütfen sol üstten müşteri seçiniz.
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              {editingGoal ? 'Hedefi Düzenle' : 'Yeni Hedef Ekle'}
            </h2>
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
                placeholder="Açıklama / Yol Haritası"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                placeholder="Başlangıç yüzdesi"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button onClick={resetForm} variant="outline">
                  İptal
                </Button>
                <Button
                  onClick={saveGoal}
                  disabled={loading}
                  className="bg-[#FF5E4A] hover:bg-[#e24d3d] text-white"
                >
                  {loading
                    ? 'Kaydediliyor...'
                    : editingGoal
                    ? 'Güncelle'
                    : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
