'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'

type ToastMessage = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (toast: Omit<ToastMessage, 'id'> & { id?: string }) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast: Omit<ToastMessage, 'id'> & { id?: string }) => {
      const id = toast.id ?? createId()
      const nextToast: ToastMessage = {
        id,
        title: toast.title,
        description: toast.description,
        variant: toast.variant ?? 'default'
      }
      setToasts((prev) => [...prev, nextToast])
      window.setTimeout(() => removeToast(id), 4000)
    },
    [removeToast]
  )

  const value = useMemo(() => ({ toast: pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-lg transition ${
              toast.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : toast.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && <p className="mt-1 text-xs opacity-80">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
