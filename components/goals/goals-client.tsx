'use client'

import { useEffect, useMemo, useState } from 'react'
import { Goal } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GoalForm } from './goal-form'
import { useToast } from '@/components/providers/toast-provider'

interface GoalsClientProps {
  initialGoals: Goal[]
}

export function GoalsClient({ initialGoals }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setGoals(initialGoals)
  }, [initialGoals])

  const progress = useMemo(() => {
    if (goals.length === 0) return 0
    const completed = goals.filter((goal) => goal.is_completed).length
    return Math.round((completed / goals.length) * 100)
  }, [goals])

  const refreshGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Hedefler yenilenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      const data = (await response.json()) as Goal[]
      setGoals(data)
    } catch (error) {
      toast({
        title: 'Hedefler yenilenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleToggle = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !goal.is_completed })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Hedef güncellenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }

      const updated = (await response.json()) as Goal
      setGoals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      toast({
        title: updated.is_completed ? 'Hedef tamamlandı' : 'Hedef güncellendi',
        description: updated.is_completed
          ? 'Harika! Bu hedef tamamlandı olarak işaretlendi.'
          : 'Hedef yeniden planlandı.',
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Hedef güncellenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleDelete = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/goals/${goal.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Hedef silinemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      toast({ title: 'Hedef silindi', description: 'Hedef listeden kaldırıldı.', variant: 'success' })
      setGoals((prev) => prev.filter((item) => item.id !== goal.id))
    } catch (error) {
      toast({
        title: 'Hedef silinemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const openCreateModal = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hedefler</h1>
          <p className="text-sm text-gray-500">Ekip hedeflerinizi planlayın ve ilerlemenizi takip edin.</p>
        </div>
        <Button onClick={openCreateModal}>+ Yeni Hedef</Button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Genel İlerleme</p>
            <p className="text-xs text-gray-500">Tamamlanan hedef yüzdesi</p>
          </div>
          <span className="text-sm font-semibold text-accent">%{progress}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          Henüz hedef oluşturulmadı. İlk hedefinizi ekleyerek ekibinizi motive edin.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex flex-1 items-start gap-3">
                <input
                  type="checkbox"
                  checked={goal.is_completed}
                  onChange={() => handleToggle(goal)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                  {goal.description && <p className="mt-1 text-xs text-gray-500">{goal.description}</p>}
                </div>
              </label>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button variant="secondary" onClick={() => openEditModal(goal)}>
                  Düzenle
                </Button>
                <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(goal)}>
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        title={editingGoal ? 'Hedefi Düzenle' : 'Yeni Hedef Oluştur'}
      >
        <GoalForm
          initialData={editingGoal ?? undefined}
          onSuccess={(goal) => {
            setIsModalOpen(false)
            setEditingGoal(null)
            setGoals((prev) => {
              const exists = prev.some((item) => item.id === goal.id)
              if (exists) {
                return prev.map((item) => (item.id === goal.id ? goal : item))
              }
              return [...prev, goal]
            })
            refreshGoals()
          }}
        />
      </Modal>
    </div>
  )
}
