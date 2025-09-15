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

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const refreshProjects = async () => {
    const response = await fetch('/api/projects')
    if (response.ok) {
      const data = await response.json()
      setProjects(data)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projeler</h1>
          <p className="text-sm text-gray-500">Tüm çalışma alanınızdaki projeleri yönetin.</p>
        </div>
        <Button onClick={() => {
          setEditingProject(undefined)
          setIsModalOpen(true)
        }}>+ Yeni Proje</Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          Henüz proje oluşturulmadı. Başlamak için “Yeni Proje” butonuna tıklayın.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDelete} />
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
