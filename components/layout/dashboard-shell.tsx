import { ReactNode } from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'

interface DashboardShellProps {
  children: ReactNode
  user: {
    full_name: string | null
    email: string
    role: 'admin' | 'user'
  }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
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
  )
}
