'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'

export default function ProjectsPage() {
  const supabase = createClientComponentClient<Database>()
  const [projects, setProjects] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  async function createProject() {
    if (!title.trim()) return
    setLoading(true)
    const { error } = await supabase.from('projects').insert([
      {
        title,
        description,
        due_date: dueDate || null,
        progress: progress || 0
      }
    ])
    setLoading(false)
    if (!error) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setProgress(0)
      setShowModal(false)
      fetchProjects()
    } else {
      alert('Proje eklenemedi: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projeler</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <h3 className="font-semibold">{project.title}</h3>
              <span className="text-xs text-gray-500">
                {project.due_date ? formatDate(project.due_date) : 'Teslim tarihi yok'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{project.description ?? 'Açıklama yok'}</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-accent"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-accent">İlerleme: %{project.progress}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Yeni Proje Ekle</h2>
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
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                placeholder="İlerleme (%)"
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
                  onClick={createProject}
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
