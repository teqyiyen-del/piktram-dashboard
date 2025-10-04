'use client'

import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* İçerik */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl transition-colors duration-300 dark:bg-surface-dark overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5E4A] text-lg font-bold text-white shadow-md hover:bg-[#e14d3e] focus:outline-none"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}
