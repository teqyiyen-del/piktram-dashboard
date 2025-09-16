'use client'

import { Project } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
<<<<<<< HEAD
import { InlineEdit } from '@/components/ui/inline-edit'
=======
>>>>>>> codex-restore-ux

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
<<<<<<< HEAD
  onUpdate: (projectId: string, payload: Partial<Project>) => Promise<void>
}

export function ProjectCard({ project, onEdit, onDelete, onUpdate }: ProjectCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-card dark:border-gray-700 dark:bg-surface-dark">
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <InlineEdit
              value={project.title}
              onSave={(next) => onUpdate(project.id, { title: next })}
              className="text-lg font-semibold text-gray-900 transition-colors duration-200 hover:text-accent dark:text-white"
            />
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              Teslim: {formatDate(project.due_date) || 'Belirtilmedi'}
            </span>
          </div>
          {project.description && <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{project.description}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>İlerleme</span>
            <span>%{project.progress}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={() => onEdit(project)}>
          Düzenle
        </Button>
        <Button variant="ghost" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" onClick={() => onDelete(project)}>
=======
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
          <span className="text-xs text-gray-400">Teslim: {formatDate(project.due_date)}</span>
        </div>
        <p className="text-sm text-gray-500">{project.description}</p>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>İlerleme</span>
            <span>%{project.progress}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => onEdit(project)}>
          Düzenle
        </Button>
        <Button variant="ghost" className="text-red-500" onClick={() => onDelete(project)}>
>>>>>>> codex-restore-ux
          Sil
        </Button>
      </div>
    </div>
  )
}
