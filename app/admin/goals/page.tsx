'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  company: string | null
}

export default function GoalsPage() {
  const supabase = createClientComponentClient<Database>()
  const [goals, setGoals] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [goalClient, setGoalClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchGoals()
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, company')
    setClients(data || [])
  }

  async function fetchGoals(clientId?: string | null) {
    let query = supabase
      .from('goals')
      .select('*, profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('user_id', clientId)

    const { data } = await query
    setGoals(data || [])
  }

  async function createGoal() {
    if (!title.trim() || !goalClient) {
      alert('Başlık ve müşteri seçimi zorunlu.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('goals').insert([
      {
        title,
        description,
        due_date: dueDate || null,
        is_completed: false,
        user_id: goalClient
      }
    ])
    setLoading(false)
    if (!error) {
      resetForm()
      fetchGoals(selectedClient)
    } else {
      alert('Hedef eklenemedi: ' + error.message)
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    await supabase.from('goals').update({ is_completed: !current }).eq('id', id)
    fetchGoals(selectedClient)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setDueDate('')
    setGoalClient(null)
    setShowModal(false)
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
            Müşterilerinize ait hedefleri görüntüleyin ve yönetin.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Hedef
        </Button>
      </header>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedClient ?? ''}
          onChange={(e) => {
            setSelectedClient(e.target.value || null)
            fetchGoals(e.target.value || null)
          }}
          className="w-64 rounded-md border px-2 py-1"
        >
          <option value="">Tüm Müşteriler</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
            </option>
          ))}
        </select>
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
            <p className="text-xs text-gray-400 mt-1">
              Müşteri: {goal.profiles?.full_name ?? goal.profiles?.email}{' '}
              {goal.profiles?.company ? `(${goal.profiles.company})` : ''}
            </p>
            <button
              onClick={() => toggleComplete(goal.id, goal.is_completed)}
              className="mt-2 text-xs font-medium text-accent hover:underline"
            >
              {goal.is_completed ? 'Tamamlandı → Geri Al' : 'Tamamla'}
            </button>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-sm text-gray-500">Henüz hedef bulunamadı.</p>
        )}
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
              <select
                value={goalClient ?? ''}
                onChange={(e) => setGoalClient(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Müşteri seçin</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                >
                  İptal
                </Button>
                <Button
                  onClick={createGoal}
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
