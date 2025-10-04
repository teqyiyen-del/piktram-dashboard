'use client'

import { ReactNode, useState } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import ProtectedClient from '@/components/layout/protected-client'

type UserInfo = {
  full_name: string
  email: string
  role: 'admin' | 'user'
}

export default function ClientLayoutWrapper({
  user,
  children,
}: {
  user: UserInfo
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted dark:bg-background-dark">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Sağ taraf */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <Topbar
          fullName={user.full_name}
          email={user.email}
          role={user.role}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* İçerik */}
        <ProtectedClient user={user}>
          <main className="min-h-screen w-full pt-[var(--topbar-height)] lg:pl-[var(--sidebar-width)]">
            {children}
          </main>
        </ProtectedClient>
      </div>
    </div>
  )
}
