'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { FolderKanban, PlusCircle, Trash2, Pencil } from 'lucide-react'

export default function ProjectsPage() {
  const supabase = createClientComponentClient<Database>()
  const [projects, setProjects] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)

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
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (error) console.error('Projeler alınamadı:', error.message)
    setProjects(data || [])
  }

  async function handleSaveProject() {
    if (!title.trim()) {
      alert('Başlık zorunlu.')
      return
    }

    // ❗️ Eğer müşteri seçilmemişse uyarı
    if (!projects.length || !projects[0]?.user_id) {
      alert('Proje eklemek için önce müşteri seçmelisin!')
      return
    }

    setLoading(true)

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          title,
          description,
          due_date: dueDate || null,
          progress: progress || 0,
        })
        .eq('id', editingProject.id)

      if (error) alert('Proje güncellenemedi: ' + error.message)
    } else {
      const { error } = await supabase.from('projects').insert([
        {
          title,
          description,
          due_date: dueDate || null,
          progress: progress || 0,
          user_id: projects[0].user_id, // mevcut müşteri
        },
      ])
      if (error) alert('Proje eklenemedi: ' + error.message)
    }

    setLoading(false)
    resetForm()
    fetchProjects()
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Bu projeyi silmek istediğine emin misin?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) alert('Proje silinemedi: ' + error.message)
    fetchProjects()
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setDueDate('')
    setProgress(0)
    setEditingProject(null)
    setShowModal(false)
  }

  function openEditModal(project: any) {
    setEditingProject(project)
    setTitle(project.title)
    setDescription(project.description || '')
    setDueDate(project.due_date || '')
    setProgress(project.progress || 0)
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
            <FolderKanban className="h-6 w-6" />
            Projeler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Tüm projeleri yönetin, düzenleyin, silin veya yeni projeler ekleyin.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Proje
        </Button>
      </header>

      {/* Project List */}
      <Card>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{project.title}</h3>
                <span className="text-xs text-gray-500">
                  {project.due_date ? formatDate(project.due_date) : 'Teslim tarihi yok'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{project.description ?? 'Açıklama yok'}</p>
              <p className="mt-1 text-sm text-gray-500">
                Müşteri: {project.profiles?.full_name ?? project.profiles?.email}{' '}
                {project.profiles?.company ? `(${project.profiles.company})` : ''}
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-[#FF5E4A]"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-[#FF5E4A]">İlerleme: %{project.progress}</p>

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(project)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" /> Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Sil
                </Button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-6">Henüz proje eklenmedi.</p>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => resetForm()}
        title={editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
      >
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <Input
            as="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama"
          />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            placeholder="İlerleme (%)"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => resetForm()} disabled={loading}>
              İptal
            </Button>
            <Button
              onClick={handleSaveProject}
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
