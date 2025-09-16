'use client'

import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ProjectForm } from './project-form'
import { ProjectCard } from './project-card'

interface ProjectsClientProps {
  initialProjects: Project[]
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [inlineError, setInlineError] = useState<string | null>(null)

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const refreshProjects = async () => {
    const response = await fetch('/api/projects')
    if (response.ok) {
      const data = await response.json()
      setProjects(data)
      setInlineError(null)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleDelete = async (project: Project) => {
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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projeler</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tüm çalışma alanınızdaki projeleri yönetin.</p>
        </div>
        <Button onClick={() => {
          setEditingProject(undefined)
          setIsModalOpen(true)
        }}>+ Yeni Proje</Button>
      </div>

      {inlineError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{inlineError}</p>}

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-surface p-12 text-center text-sm text-gray-500 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-400">
          Henüz proje oluşturulmadı. Başlamak için “Yeni Proje” butonuna tıklayın.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDelete} onUpdate={handleInlineUpdate} />
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
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingProject(undefined)
            refreshProjects()
          }}
        />
      </Modal>
    </div>
  )
}
