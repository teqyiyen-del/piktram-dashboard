'use client'

import { Project } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
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
          Sil
        </Button>
      </div>
    </div>
  )
}
