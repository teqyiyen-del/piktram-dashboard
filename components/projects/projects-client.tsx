'use client'

import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ProjectForm } from './project-form'
import { ProjectCard } from './project-card'
<<<<<<< HEAD
=======
import { useToast } from '@/components/providers/toast-provider'
>>>>>>> codex-restore-ux

interface ProjectsClientProps {
  initialProjects: Project[]
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
<<<<<<< HEAD
  const [inlineError, setInlineError] = useState<string | null>(null)
=======
  const { toast } = useToast()
>>>>>>> codex-restore-ux

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const refreshProjects = async () => {
<<<<<<< HEAD
    const response = await fetch('/api/projects')
    if (response.ok) {
      const data = await response.json()
      setProjects(data)
      setInlineError(null)
=======
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Projeler yenilenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      const data = (await response.json()) as Project[]
      setProjects(data)
    } catch (error) {
      toast({
        title: 'Projeler yenilenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
>>>>>>> codex-restore-ux
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleDelete = async (project: Project) => {
<<<<<<< HEAD
    await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    refreshProjects()
  }

  const handleInlineUpdate = async (projectId: string, payload: Partial<Project>) => {
    setInlineError(null)
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setInlineError(data.error ?? 'Proje güncellenemedi')
      return
    }

    const updated = await response.json()
    setProjects((prev) => prev.map((project) => (project.id === projectId ? { ...project, ...updated } : project)))
=======
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Proje silinemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      toast({ title: 'Proje silindi', description: 'Proje başarıyla kaldırıldı.', variant: 'success' })
      refreshProjects()
    } catch (error) {
      toast({
        title: 'Proje silinemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
>>>>>>> codex-restore-ux
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projeler</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tüm çalışma alanınızdaki projeleri yönetin.</p>
=======
          <h1 className="text-2xl font-semibold text-gray-900">Projeler</h1>
          <p className="text-sm text-gray-500">Tüm çalışma alanınızdaki projeleri yönetin.</p>
>>>>>>> codex-restore-ux
        </div>
        <Button onClick={() => {
          setEditingProject(undefined)
          setIsModalOpen(true)
        }}>+ Yeni Proje</Button>
      </div>

<<<<<<< HEAD
      {inlineError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{inlineError}</p>}

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-surface p-12 text-center text-sm text-gray-500 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-400">
=======
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
>>>>>>> codex-restore-ux
          Henüz proje oluşturulmadı. Başlamak için “Yeni Proje” butonuna tıklayın.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
<<<<<<< HEAD
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDelete} onUpdate={handleInlineUpdate} />
=======
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDelete} />
>>>>>>> codex-restore-ux
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
      >
        <ProjectForm
          initialData={editingProject}
<<<<<<< HEAD
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingProject(undefined)
=======
          onSuccess={(project) => {
            setIsModalOpen(false)
            setEditingProject(undefined)
            setProjects((prev) => {
              const exists = prev.some((item) => item.id === project.id)
              if (exists) {
                return prev.map((item) => (item.id === project.id ? project : item))
              }
              return [...prev, project]
            })
>>>>>>> codex-restore-ux
            refreshProjects()
          }}
        />
      </Modal>
    </div>
  )
}
