'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onSave: (next: string) => Promise<void>
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function InlineEdit({ value, onSave, placeholder, className, inputClassName, disabled }: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    if (disabled) return
    setEditing(true)
    setError(null)
  }

  const commit = async () => {
    if (!editing) return
    const trimmed = draft.trim()
    if (!trimmed) {
      setError('Başlık boş olamaz')
      return
    }
    if (trimmed === value.trim()) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
    setError(null)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              cancel()
            }
          }}
          className={cn(
            'rounded-md border border-accent/30 bg-white px-2 py-1 text-sm focus:border-accent focus:ring-0 dark:border-accent/40 dark:bg-surface-dark dark:text-gray-100',
            inputClassName
          )}
        />
        {(saving || error) && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {saving ? 'Kaydediliyor…' : error}
          </span>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={cn(
        'text-left transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      {value ? value : <span className="text-sm text-gray-400">{placeholder ?? 'Düzenlemek için tıklayın'}</span>}
    </button>
  )
}
