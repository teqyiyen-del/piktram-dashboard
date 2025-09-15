'use client'

import { Project } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onUpdate: (projectId: string, payload: Partial<Project>) => Promise<void>
}

export function ProjectCard({ project, onEdit, onDelete, onUpdate }: ProjectCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <InlineEdit
            value={project.title}
            onSave={(next) => onUpdate(project.id, { title: next })}
            className="text-lg font-semibold text-gray-900 dark:text-white"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">Teslim: {formatDate(project.due_date)}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>İlerleme</span>
            <span>%{project.progress}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => onEdit(project)}>
          Düzenle
        </Button>
        <Button variant="ghost" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" onClick={() => onDelete(project)}>
          Sil
        </Button>
      </div>
    </div>
  )
}
