'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { getAdminStats } from '@/lib/getAdminStats'

type UserRecord = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string
}

type ProjectRecord = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
  created_at: string
}

type TaskRecord = {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  user_id: string
  attachment_url: string | null
  created_at: string
}

interface AdminDashboardProps {
  users?: UserRecord[]
  projects?: ProjectRecord[]
  tasks?: TaskRecord[]
  ownerMap?: Record<string, { full_name: string | null; email: string | null }>
}

const statusLabels: Record<TaskRecord['status'], string> = {
  todo: 'Yapılacak',
  in_progress: 'Devam Ediyor',
  done: 'Tamamlandı'
}

const priorityLabels: Record<TaskRecord['priority'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
}

export default function AdminDashboard({ users = [], projects = [], tasks = [], ownerMap = {} }: AdminDashboardProps) {
  const [userList, setUserList] = useState(users)
  const [owners, setOwners] = useState(ownerMap)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0 })
  const [pagination] = useState({
    projectsPage: 1,
    projectsTotalPages: 1,
    tasksPage: 1,
    tasksTotalPages: 1
  })

  // 📊 Admin istatistiklerini yükle
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats()
        setStats(data)
      } catch (error) {
        console.error('Admin stats alınamadı:', error)
      }
    }
    loadStats()
  }, [])

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    setFeedback(null)
    setPendingUserId(userId)
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    })
    setPendingUserId(null)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setFeedback({ type: 'error', message: data.error ?? 'Rol güncellenemedi.' })
      return
    }

    const updated = await response.json()
    setUserList((prev) => prev.map((user) => (user.id === updated.id ? { ...user, role: updated.role } : user)))
    setOwners((prev) => ({
      ...prev,
      [updated.id]: {
        full_name: updated.full_name ?? prev[updated.id]?.full_name ?? null,
        email: updated.email ?? prev[updated.id]?.email ?? null
      }
    }))
    setFeedback({ type: 'success', message: 'Kullanıcı rolü başarıyla güncellendi.' })
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-surface p-8 shadow-sm transition-colors duration-300 dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Paneli</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Tüm ekip üyelerini, projeleri ve görevleri tek yerden denetleyin.
        </p>
      </header>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* 📊 İstatistikler */}
      <section className="grid gap-6 md:grid-cols-3">
        <StatTile title="Toplam Kullanıcı" value={stats?.users} description="Aktif hesap sayısı" />
        <StatTile title="Projeler" value={stats?.projects} description="Çalışma alanındaki projeler" />
        <StatTile title="Görevler" value={stats?.tasks} description="Yönetilen tüm görevler" />
      </section>

      {/* 👤 Kullanıcılar */}
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kullanıcılar</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rol ve iletişim bilgilerini görüntüleyin.</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{userList.length} kayıt</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm dark:divide-gray-700 dark:bg-surface-dark">
              {userList.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{user.full_name ?? 'İsimsiz Kullanıcı'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={user.role ?? 'user'}
                        onChange={(event) => handleRoleChange(user.id, event.target.value as 'user' | 'admin')}
                        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-accent focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Yönetici</option>
                      </select>
                      {pendingUserId === user.id && <span className="text-xs text-accent">Kaydediliyor...</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatTile({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-brand-card transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}
