'use client'

import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
<<<<<<< HEAD
  actions?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
=======
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
>>>>>>> codex-restore-ux
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
<<<<<<< HEAD
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl transition-colors duration-300 dark:bg-surface-dark">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={onClose}
              className="text-xl text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
=======
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 transition hover:text-gray-600">×</button>
>>>>>>> codex-restore-ux
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
