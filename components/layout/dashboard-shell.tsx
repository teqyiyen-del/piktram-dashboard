<<<<<<< HEAD
'use client'

import { ReactNode, useState } from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'
import { NotificationProvider } from '@/components/providers/notification-provider'
=======
import { ReactNode } from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'
>>>>>>> codex-restore-ux

interface DashboardShellProps {
  children: ReactNode
  user: {
    full_name: string | null
    email: string
    role: 'admin' | 'user'
  }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
<<<<<<< HEAD
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-muted transition-colors duration-300 dark:bg-muted-dark">
        <Sidebar role={user.role} open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex flex-1 flex-col">
          <Topbar
            fullName={user.full_name}
            email={user.email}
            role={user.role}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto bg-muted/70 px-6 pb-12 pt-8 transition-colors duration-300 dark:bg-muted-dark">
            <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </NotificationProvider>
=======
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar fullName={user.full_name} email={user.email} />
        <main className="flex-1 overflow-y-auto bg-muted p-8">
          {children}
        </main>
      </div>
    </div>
>>>>>>> codex-restore-ux
  )
}
