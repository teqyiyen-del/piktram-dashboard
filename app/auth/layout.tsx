import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
            P
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Piktram</h1>
          <p className="text-sm text-gray-500">Projelerinizi yönetmek için akıllı yol arkadaşınız.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
