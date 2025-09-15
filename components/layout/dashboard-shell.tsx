import { ReactNode } from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'

interface DashboardShellProps {
  children: ReactNode
  user: {
    full_name: string | null
    email: string
  }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar fullName={user.full_name} email={user.email} />
        <main className="flex-1 overflow-y-auto bg-muted p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
