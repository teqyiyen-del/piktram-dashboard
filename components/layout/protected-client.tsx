'use client'

import { ReactNode } from 'react'
import DashboardShell from '@/components/layout/dashboard-shell'

interface ProtectedClientProps {
  children: ReactNode
  user: {
    full_name: string | null
    email: string
    role: 'admin' | 'user' | null
  }
}

export default function ProtectedClient({ children, user }: ProtectedClientProps) {
  return (
    <DashboardShell
      user={{
        full_name: user.full_name ?? '',
        email: user.email,
        role: user.role ?? 'user',
      }}
    >
      {children}
    </DashboardShell>
  )
}
